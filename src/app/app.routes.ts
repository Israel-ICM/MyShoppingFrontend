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
          import('./views/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'compras',
        data: { title: 'Compras' },
        loadComponent: () =>
          import('./views/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
      },
      {
        path: 'inventario',
        data: { title: 'Inventario' },
        loadComponent: () =>
          import('./views/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
      },
      {
        path: 'pedidos',
        data: { title: 'Pedidos' },
        loadComponent: () =>
          import('./views/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
      },
      {
        path: 'usuarios',
        data: { title: 'Usuarios' },
        loadComponent: () =>
          import('./views/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
      },
      {
        path: 'reportes',
        data: { title: 'Reportes' },
        loadComponent: () =>
          import('./views/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
