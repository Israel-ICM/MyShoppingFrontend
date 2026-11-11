import { provideRouter, Router, UrlTree } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

/** Snapshots mínimos requeridos por la firma de CanActivateFn; el guard no los usa. */
const route = {} as unknown as ActivatedRouteSnapshot;
const state = {} as unknown as RouterStateSnapshot;

describe('authGuard', () => {
  function setup(isAuthenticated: boolean): Router {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => isAuthenticated } },
      ],
    });
    return TestBed.inject(Router);
  }

  // REQ-4.1
  it('allows activation when the session is authenticated', () => {
    setup(true);

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(result).toBe(true);
  });

  // REQ-4.2
  it('returns a UrlTree to /login (not a boolean false) when the session is not authenticated', () => {
    const router = setup(false);

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });
});
