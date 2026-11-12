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
      import('./views/public/public-layout/public-layout.component').then(
        (m) => m.PublicLayoutComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./views/public/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'pedido',
        loadComponent: () =>
          import('./views/public/order-page/order-page.component').then(
            (m) => m.OrderPageComponent,
          ),
      },
    ],
  },
  {
    path: 'admin',
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
        path: 'productos',
        loadComponent: () =>
          import('./views/products/product-list/product-list.component').then(
            (m) => m.ProductListComponent,
          ),
      },
      {
        path: 'productos/nuevo',
        loadComponent: () =>
          import('./views/products/product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
      },
      {
        path: 'productos/:id',
        loadComponent: () =>
          import('./views/products/product-detail/product-detail.component').then(
            (m) => m.ProductDetailComponent,
          ),
      },
      {
        path: 'productos/:id/editar',
        loadComponent: () =>
          import('./views/products/product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
      },
      {
        path: 'compras',
        loadComponent: () =>
          import('./views/compras/compra-list/compra-list.component').then((m) => m.CompraListComponent),
      },
      {
        path: 'compras/nueva',
        loadComponent: () =>
          import('./views/compras/compra-form/compra-form.component').then((m) => m.CompraFormComponent),
      },
      {
        path: 'compras/proveedores',
        loadComponent: () =>
          import('./views/compras/proveedor-list/proveedor-list.component').then(
            (m) => m.ProveedorListComponent,
          ),
      },
      {
        path: 'compras/proveedores/nuevo',
        loadComponent: () =>
          import('./views/compras/proveedor-form/proveedor-form.component').then(
            (m) => m.ProveedorFormComponent,
          ),
      },
      {
        path: 'compras/proveedores/:id/editar',
        loadComponent: () =>
          import('./views/compras/proveedor-form/proveedor-form.component').then(
            (m) => m.ProveedorFormComponent,
          ),
      },
      {
        path: 'compras/:id',
        loadComponent: () =>
          import('./views/compras/compra-detail/compra-detail.component').then(
            (m) => m.CompraDetailComponent,
          ),
      },
      {
        path: 'inventario',
        data: { title: 'Inventario' },
        loadComponent: () =>
          import('./views/inventario/inventario.component').then((m) => m.InventarioComponent),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./views/pedidos/pedido-list/pedido-list.component').then((m) => m.PedidoListComponent),
      },
      {
        path: 'pedidos/:id',
        loadComponent: () =>
          import('./views/pedidos/pedido-detail/pedido-detail.component').then(
            (m) => m.PedidoDetailComponent,
          ),
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
