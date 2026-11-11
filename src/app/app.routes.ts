import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./views/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./views/protected-layout/protected-layout.component').then(
        (m) => m.ProtectedLayoutComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./views/dashboard/dashboard-placeholder.component').then(
            (m) => m.DashboardPlaceholderComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
