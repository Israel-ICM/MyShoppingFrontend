import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JwtPayload } from '../models/jwt-payload.model';
import { AuthTokens, RefreshResponse } from '../models/tokens.model';
import { TokenStorageService } from './token-storage.service';

const GENERIC_CREDENTIALS_ERROR = 'Usuario o contraseña incorrectos';
const NETWORK_ERROR = 'No se pudo conectar. Intentá de nuevo.';

/**
 * Estado de sesión expuesto como signal. Delega la persistencia en TokenStorageService
 * y nunca filtra el detalle crudo de errores del backend al consumidor.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly accessToken = signal<string | null>(this.hydrateAccessToken());

  readonly isAuthenticated = computed(() => !!this.accessToken());

  /** `username` del claim del JWT si el backend lo expone; el token actual no trae roles. */
  readonly username = computed(() => {
    const token = this.accessToken();
    if (!token) {
      return null;
    }
    const claim = this.decodeAccessToken(token)?.['username'];
    return typeof claim === 'string' ? claim : null;
  });

  login(username: string, password: string): Observable<void> {
    return this.http
      .post<AuthTokens>(`${environment.apiUrl}/token/`, { username, password })
      .pipe(
        tap((tokens) => {
          this.tokenStorage.set(tokens.access, tokens.refresh);
          this.accessToken.set(tokens.access);
        }),
        map(() => undefined),
        catchError((error: HttpErrorResponse) => throwError(() => this.toLoginError(error))),
      );
  }

  refresh(): Observable<void> {
    const refreshToken = this.tokenStorage.getRefresh();

    return this.http
      .post<RefreshResponse>(`${environment.apiUrl}/token/refresh/`, { refresh: refreshToken })
      .pipe(
        tap(({ access }) => {
          this.tokenStorage.setAccess(access);
          this.accessToken.set(access);
        }),
        map(() => undefined),
      );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /**
   * Resuelve si hay sesión utilizable, intentando un refresh silencioso cuando el access
   * token ya venció (5 min) pero el refresh token (1 día) todavía es válido. Sin esto, recargar
   * la página después de 5 minutos mandaba al usuario a /login aunque su sesión siguiera viva.
   */
  ensureSession(): Observable<boolean> {
    if (this.isAuthenticated()) {
      return of(true);
    }
    if (!this.tokenStorage.getRefresh()) {
      return of(false);
    }
    return this.refresh().pipe(
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      }),
    );
  }

  private clearSession(): void {
    this.tokenStorage.clear();
    this.accessToken.set(null);
  }

  private toLoginError(error: HttpErrorResponse): Error {
    if (error.status === 0) {
      return new Error(NETWORK_ERROR);
    }
    return new Error(GENERIC_CREDENTIALS_ERROR);
  }

  private hydrateAccessToken(): string | null {
    const storedAccess = this.tokenStorage.getAccess();
    if (!storedAccess) {
      return null;
    }
    return this.decodeAccessToken(storedAccess) ? storedAccess : null;
  }

  private decodeAccessToken(token: string): JwtPayload | null {
    const segments = token.split('.');
    if (segments.length !== 3) {
      return null;
    }
    try {
      const normalized = segments[1].replace(/-/g, '+').replace(/_/g, '/');
      const padding = (4 - (normalized.length % 4)) % 4;
      const json = atob(normalized + '='.repeat(padding));
      const payload = JSON.parse(json) as JwtPayload;
      return this.isExpired(payload) ? null : payload;
    } catch {
      return null;
    }
  }

  /** A token is expired once its `exp` claim (seconds since epoch) is at or before now. */
  private isExpired(payload: JwtPayload): boolean {
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  }
}
