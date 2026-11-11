import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../../environments/environment';

/** Construye un JWT estructuralmente válido (header.payload.signature) solo para decodificación en test. */
function fakeJwt(payload: Record<string, unknown>): string {
  const toBase64 = (value: unknown) => btoa(JSON.stringify(value));
  return `${toBase64({ alg: 'none' })}.${toBase64(payload)}.signature`;
}

interface TokenStorageMock {
  getAccess: ReturnType<typeof vi.fn>;
  getRefresh: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  setAccess: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
}

interface RouterMock {
  navigate: ReturnType<typeof vi.fn>;
}

describe('AuthService', () => {
  let httpMock: HttpTestingController;
  let tokenStorage: TokenStorageMock;
  let router: RouterMock;

  function setup(accessAtBootstrap: string | null = null): AuthService {
    tokenStorage = {
      getAccess: vi.fn().mockReturnValue(accessAtBootstrap),
      getRefresh: vi.fn().mockReturnValue(null),
      set: vi.fn(),
      setAccess: vi.fn(),
      clear: vi.fn(),
    };
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TokenStorageService, useValue: tokenStorage },
        { provide: Router, useValue: router },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    return TestBed.inject(AuthService);
  }

  afterEach(() => {
    httpMock.verify();
  });

  // REQ-2.1
  it('logs in with valid credentials, stores both tokens and marks the session as authenticated', () => {
    const service = setup();
    let completed = false;

    service.login('ana', 'secret123').subscribe({ complete: () => (completed = true) });

    const req = httpMock.expectOne(`${environment.apiUrl}/token/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'ana', password: 'secret123' });
    req.flush({ access: 'access-abc', refresh: 'refresh-xyz' });

    expect(tokenStorage.set).toHaveBeenCalledWith('access-abc', 'refresh-xyz');
    expect(service.isAuthenticated()).toBe(true);
    expect(completed).toBe(true);
  });

  // REQ-2.2
  it('propagates a generic message on invalid credentials without leaking the raw backend detail, and stores no tokens', () => {
    const service = setup();
    let receivedError: Error | undefined;

    service.login('ana', 'wrong').subscribe({ error: (err: Error) => (receivedError = err) });

    const req = httpMock.expectOne(`${environment.apiUrl}/token/`);
    req.flush(
      { detail: 'No active account found with the given credentials' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(receivedError?.message).toBe('Usuario o contraseña incorrectos');
    expect(receivedError?.message).not.toContain('No active account');
    expect(tokenStorage.set).not.toHaveBeenCalled();
    expect(service.isAuthenticated()).toBe(false);
  });

  // REQ-2.3
  it('propagates a network error when the request cannot reach the server, and stores no tokens', () => {
    const service = setup();
    let receivedError: Error | undefined;

    service.login('ana', 'secret123').subscribe({ error: (err: Error) => (receivedError = err) });

    const req = httpMock.expectOne(`${environment.apiUrl}/token/`);
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(receivedError?.message).toBe('No se pudo conectar. Intentá de nuevo.');
    expect(tokenStorage.set).not.toHaveBeenCalled();
    expect(service.isAuthenticated()).toBe(false);
  });

  // REQ-2.4
  it('refreshes only the access token when the stored refresh token is valid', () => {
    const service = setup();
    tokenStorage.getRefresh.mockReturnValue('refresh-xyz');
    let completed = false;

    service.refresh().subscribe({ complete: () => (completed = true) });

    const req = httpMock.expectOne(`${environment.apiUrl}/token/refresh/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refresh: 'refresh-xyz' });
    req.flush({ access: 'access-new' });

    expect(tokenStorage.setAccess).toHaveBeenCalledWith('access-new');
    expect(tokenStorage.set).not.toHaveBeenCalled();
    expect(service.isAuthenticated()).toBe(true);
    expect(completed).toBe(true);
  });

  // REQ-2.5
  it('propagates the error when the stored refresh token is invalid or expired', () => {
    const service = setup();
    tokenStorage.getRefresh.mockReturnValue('refresh-expired');
    let errored = false;

    service.refresh().subscribe({ error: () => (errored = true) });

    const req = httpMock.expectOne(`${environment.apiUrl}/token/refresh/`);
    req.flush({ detail: 'token_not_valid' }, { status: 401, statusText: 'Unauthorized' });

    expect(errored).toBe(true);
    expect(tokenStorage.setAccess).not.toHaveBeenCalled();
  });

  // REQ-2.6
  it('clears local tokens, resets the session signal and redirects to /login on logout', () => {
    const service = setup(fakeJwt({ exp: Date.now() / 1000 + 3600 }));

    service.logout();

    expect(tokenStorage.clear).toHaveBeenCalled();
    expect(service.isAuthenticated()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  // REQ-2.7
  it('hydrates the access token from storage on bootstrap without issuing a request', () => {
    const service = setup(fakeJwt({ exp: Date.now() / 1000 + 3600 }));

    expect(service.isAuthenticated()).toBe(true);
    httpMock.expectNone(`${environment.apiUrl}/token/`);
  });

  // REQ-2.8
  it('does not crash and treats the session as unauthenticated when the stored access token is corrupted', () => {
    const service = setup('not-a-valid-jwt');

    expect(service.isAuthenticated()).toBe(false);
  });

  // Follow-up (verify-report WARNING #2): decodeAccessToken only checked decodability,
  // not expiration. A structurally valid but expired token must be treated as unauthenticated.
  it('treats the stored access token as unauthenticated when it is structurally valid but expired', () => {
    const service = setup(fakeJwt({ exp: Date.now() / 1000 - 3600 }));

    expect(service.isAuthenticated()).toBe(false);
  });

  // Follow-up (reported by the user as "la sesión se muere muy rápido"): a reload after the
  // short-lived access token (5 min) expires must silently refresh using the still-valid
  // refresh token (1 day), instead of forcing a logout just because of the reload.
  describe('ensureSession', () => {
    it('resolves true immediately when already authenticated, without issuing a request', async () => {
      const service = setup(fakeJwt({ exp: Date.now() / 1000 + 3600 }));

      const ok = await firstValueFrom(service.ensureSession());

      expect(ok).toBe(true);
      httpMock.expectNone(`${environment.apiUrl}/token/refresh/`);
    });

    it('resolves false immediately when there is no access token and no refresh token', async () => {
      const service = setup();
      tokenStorage.getRefresh.mockReturnValue(null);

      const ok = await firstValueFrom(service.ensureSession());

      expect(ok).toBe(false);
      httpMock.expectNone(`${environment.apiUrl}/token/refresh/`);
    });

    it('attempts a silent refresh when the access token is gone but a refresh token exists, and resolves true on success', async () => {
      const service = setup();
      tokenStorage.getRefresh.mockReturnValue('refresh-xyz');

      const resultPromise = firstValueFrom(service.ensureSession());

      const req = httpMock.expectOne(`${environment.apiUrl}/token/refresh/`);
      req.flush({ access: 'access-new' });

      expect(await resultPromise).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('resolves false and clears the session when the silent refresh fails', async () => {
      const service = setup();
      tokenStorage.getRefresh.mockReturnValue('refresh-expired');

      const resultPromise = firstValueFrom(service.ensureSession());

      const req = httpMock.expectOne(`${environment.apiUrl}/token/refresh/`);
      req.flush({ detail: 'token_not_valid' }, { status: 401, statusText: 'Unauthorized' });

      expect(await resultPromise).toBe(false);
      expect(tokenStorage.clear).toHaveBeenCalled();
    });
  });
});
