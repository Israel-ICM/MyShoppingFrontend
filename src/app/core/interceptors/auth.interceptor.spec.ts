import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { environment } from '../../../environments/environment';

const ITEMS_URL = `${environment.apiUrl}/items`;
const CART_URL = `${environment.apiUrl}/cart`;
const PROFILE_URL = `${environment.apiUrl}/profile`;
const LOGIN_URL = `${environment.apiUrl}/token/`;
const REFRESH_URL = `${environment.apiUrl}/token/refresh/`;

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

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let tokenStorage: TokenStorageMock;
  let router: RouterMock;

  /** Mock de TokenStorage con estado interno real: setAccess()/set() mutan lo que getAccess() devuelve después. */
  function setup(initialAccess: string | null): void {
    let currentAccess = initialAccess;

    tokenStorage = {
      getAccess: vi.fn(() => currentAccess),
      getRefresh: vi.fn(() => 'refresh-valid'),
      set: vi.fn((access: string) => {
        currentAccess = access;
      }),
      setAccess: vi.fn((access: string) => {
        currentAccess = access;
      }),
      clear: vi.fn(() => {
        currentAccess = null;
      }),
    };
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: TokenStorageService, useValue: tokenStorage },
        { provide: Router, useValue: router },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    // Fuerza la instanciación de AuthService real (usa el TokenStorage/Router mockeados de arriba).
    TestBed.inject(AuthService);
  }

  afterEach(() => {
    httpMock.verify();
  });

  // REQ-3.1
  it('attaches the Bearer header when an access token is present', () => {
    setup('access-valid');

    httpClient.get(ITEMS_URL).subscribe();

    const req = httpMock.expectOne(ITEMS_URL);
    expect(req.request.headers.get('Authorization')).toBe('Bearer access-valid');
    req.flush({ ok: true });
  });

  // REQ-3.2
  it('sends the request without an Authorization header when there is no access token', () => {
    setup(null);

    httpClient.get(ITEMS_URL).subscribe();

    const req = httpMock.expectOne(ITEMS_URL);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ ok: true });
  });

  // REQ-3.3
  it('refreshes once and retries the original request with the new access token on a single 401', () => {
    setup('access-expired');
    let result: unknown;

    httpClient.get(ITEMS_URL).subscribe((res) => (result = res));

    const firstAttempt = httpMock.expectOne(ITEMS_URL);
    firstAttempt.flush(null, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne(REFRESH_URL);
    expect(refreshReq.request.method).toBe('POST');
    refreshReq.flush({ access: 'access-fresh' });

    const retry = httpMock.expectOne(ITEMS_URL);
    expect(retry.request.headers.get('Authorization')).toBe('Bearer access-fresh');
    retry.flush({ ok: true });

    expect(result).toEqual({ ok: true });
  });

  // REQ-3.4 (concurrencia obligatoria)
  it('triggers exactly ONE refresh for N concurrent 401 responses and retries all of them with the new token', () => {
    setup('access-expired');
    const results: unknown[] = [];

    httpClient.get(ITEMS_URL).subscribe((r) => results.push(r));
    httpClient.get(CART_URL).subscribe((r) => results.push(r));
    httpClient.get(PROFILE_URL).subscribe((r) => results.push(r));

    [ITEMS_URL, CART_URL, PROFILE_URL].forEach((url) => {
      httpMock.expectOne(url).flush(null, { status: 401, statusText: 'Unauthorized' });
    });

    const refreshRequests = httpMock.match(REFRESH_URL);
    expect(refreshRequests).toHaveLength(1);
    refreshRequests[0].flush({ access: 'access-fresh' });

    [ITEMS_URL, CART_URL, PROFILE_URL].forEach((url) => {
      const retry = httpMock.expectOne(url);
      expect(retry.request.headers.get('Authorization')).toBe('Bearer access-fresh');
      retry.flush({ ok: true });
    });

    expect(results).toHaveLength(3);
  });

  // REQ-3.5
  it('logs out and propagates the error (no retry loop) when the refresh request itself fails', () => {
    setup('access-expired');
    let receivedError: unknown;

    httpClient.get(ITEMS_URL).subscribe({ error: (err: unknown) => (receivedError = err) });

    httpMock.expectOne(ITEMS_URL).flush(null, { status: 401, statusText: 'Unauthorized' });
    httpMock
      .expectOne(REFRESH_URL)
      .flush({ detail: 'token_not_valid' }, { status: 401, statusText: 'Unauthorized' });

    expect(tokenStorage.clear).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(receivedError).toBeTruthy();
    httpMock.expectNone(ITEMS_URL);
  });

  // REQ-3.6 (anti-recursión)
  it('does not attempt a refresh when the failing request targets the token endpoints themselves', () => {
    setup(null);
    let receivedError: unknown;

    httpClient
      .post(LOGIN_URL, { username: 'ana', password: 'wrong' })
      .subscribe({ error: (err: unknown) => (receivedError = err) });

    httpMock
      .expectOne(LOGIN_URL)
      .flush({ detail: 'invalid' }, { status: 401, statusText: 'Unauthorized' });

    httpMock.expectNone(REFRESH_URL);
    expect(receivedError).toBeTruthy();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  // REQ-3.7 (concurrencia obligatoria)
  it('queues a 401 that arrives while a refresh is already in flight onto the same shared refresh', () => {
    setup('access-expired');

    httpClient.get(ITEMS_URL).subscribe();
    httpMock.expectOne(ITEMS_URL).flush(null, { status: 401, statusText: 'Unauthorized' });

    // El refresh queda EN VUELO (sin flush todavía) cuando llega un segundo 401.
    httpClient.get(CART_URL).subscribe();
    httpMock.expectOne(CART_URL).flush(null, { status: 401, statusText: 'Unauthorized' });

    const refreshRequests = httpMock.match(REFRESH_URL);
    expect(refreshRequests).toHaveLength(1);
    refreshRequests[0].flush({ access: 'access-fresh' });

    httpMock.expectOne(ITEMS_URL).flush({ ok: true });
    httpMock.expectOne(CART_URL).flush({ ok: true });
  });

  // REQ-3.8
  it('passes a successful protected response through untouched without triggering a refresh', () => {
    setup('access-valid');
    let result: unknown;

    httpClient.get(ITEMS_URL).subscribe((r) => (result = r));
    httpMock.expectOne(ITEMS_URL).flush({ ok: true });

    expect(result).toEqual({ ok: true });
    httpMock.expectNone(REFRESH_URL);
  });

  // REQ-3.9
  it('does not retry a second time when the retried request fails again after a successful refresh', () => {
    setup('access-expired');
    let receivedError: unknown;

    httpClient.get(ITEMS_URL).subscribe({ error: (err: unknown) => (receivedError = err) });

    httpMock.expectOne(ITEMS_URL).flush(null, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne(REFRESH_URL).flush({ access: 'access-fresh' });
    httpMock.expectOne(ITEMS_URL).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(receivedError).toBeTruthy();
    httpMock.expectNone(REFRESH_URL);
    httpMock.expectNone(ITEMS_URL);
  });
});
