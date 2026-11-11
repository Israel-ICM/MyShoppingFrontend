import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Protege rutas: si no hay access token vivo intenta un refresh silencioso antes de redirigir
 * (ver `AuthService.ensureSession`), para no cerrar sesión solo por recargar la página.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService
    .ensureSession()
    .pipe(map((ok) => ok || router.createUrlTree(['/login'])));
};
