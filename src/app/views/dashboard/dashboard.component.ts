import { Component } from '@angular/core';

interface StatCard {
  label: string;
  value: string;
  icon: 'compras' | 'inventario' | 'pedidos' | 'proveedores';
}

/** Resumen inicial del panel. Los valores son de ejemplo hasta conectar los endpoints de BI. */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  protected readonly stats: StatCard[] = [
    { label: 'Órdenes de compra abiertas', value: '—', icon: 'compras' },
    { label: 'Productos bajo stock mínimo', value: '—', icon: 'inventario' },
    { label: 'Pedidos pendientes', value: '—', icon: 'pedidos' },
    { label: 'Proveedores activos', value: '—', icon: 'proveedores' },
  ];
}
