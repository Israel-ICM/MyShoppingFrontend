import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, map, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

const AUTH_ENDPOINT_SUFFIXES = ['/token/', '/token/refresh/'];

/**
 * Refresh compartido a nivel de módulo: todo 401 concurrente se encola sobre la MISMA
 * ejecución en vuelo (REQ-3.4/3.7) en vez de disparar un POST /token/refresh/ por request.
 * Se resetea a null en `finalize` apenas esa única ejecución termina (éxito o error).
 */
let pendingRefresh: Observable<string> | null = null;

function isAuthEndpoint(url: string): boolean {
  return AUTH_ENDPOINT_SUFFIXES.some((suffix) => url.endsWith(suffix));
}

function attachAccessToken(
  req: HttpRequest<unknown>,
  access: string | null,
): HttpRequest<unknown> {
  if (!access || isAuthEndpoint(req.url)) {
    return req;
  }
  return req.clone({ setHeaders: { Authorization: `Bearer ${access}` } });
}

function requestRefresh(
  authService: AuthService,
  tokenStorage: TokenStorageService,
): Observable<string> {
  if (!pendingRefresh) {
    pendingRefresh = authService.refresh().pipe(
      map(() => {
        const freshAccess = tokenStorage.getAccess();
        if (!freshAccess) {
          throw new Error('Refresh completed without a new access token');
        }
        return freshAccess;
      }),
      finalize(() => {
        pendingRefresh = null;
      }),
      shareReplay(1),
    );
  }
  return pendingRefresh;
}

/**
 * Adjunta el access token (Bearer) a los requests salientes y, ante un 401 de un request
 * protegido, dispara un único refresh compartido (single-flight) y reintenta UNA sola vez.
 * Los requests a /token/ y /token/refresh/ quedan excluidos de esta lógica (anti-recursión, REQ-3.6).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenStorage = inject(TokenStorageService);

  const authReq = attachAccessToken(req, tokenStorage.getAccess());

  return next(authReq).pipe(
    catchError((error: unknown) => {
      const isRefreshableUnauthorized =
        error instanceof HttpErrorResponse && error.status === 401 && !isAuthEndpoint(req.url);

      if (!isRefreshableUnauthorized) {
        return throwError(() => error);
      }

      return requestRefresh(authService, tokenStorage).pipe(
        catchError((refreshError: unknown) => {
          authService.logout();
          return throwError(() => refreshError);
        }),
        switchMap((freshAccess) => next(attachAccessToken(req, freshAccess))),
      );
    }),
  );
};
