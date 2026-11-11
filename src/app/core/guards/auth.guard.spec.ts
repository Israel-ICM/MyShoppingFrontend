import { Observable, firstValueFrom, of } from 'rxjs';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

/** Snapshots mínimos requeridos por la firma de CanActivateFn; el guard no los usa. */
const route = {} as unknown as ActivatedRouteSnapshot;
const state = {} as unknown as RouterStateSnapshot;

function runGuard(): Observable<boolean | UrlTree> {
  return TestBed.runInInjectionContext(() => authGuard(route, state)) as Observable<
    boolean | UrlTree
  >;
}

describe('authGuard', () => {
  function setup(ensureSessionResult: boolean): Router {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { ensureSession: () => of(ensureSessionResult) } },
      ],
    });
    return TestBed.inject(Router);
  }

  // REQ-4.1
  it('allows activation when ensureSession resolves true', async () => {
    setup(true);

    const result = await firstValueFrom(runGuard());

    expect(result).toBe(true);
  });

  // REQ-4.2
  it('returns a UrlTree to /login (not a boolean false) when ensureSession resolves false', async () => {
    const router = setup(false);

    const result = await firstValueFrom(runGuard());

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });
});
