import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ComprasService } from '../../../core/services/compras.service';
import { Compra, ESTADOS_COMPRA, Proveedor } from '../../../core/models/compra.model';

@Component({
  selector: 'app-compra-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './compra-list.component.html',
  styleUrl: './compra-list.component.scss',
})
export class CompraListComponent {
  private readonly comprasService = inject(ComprasService);

  readonly compras = signal<Compra[]>([]);
  readonly proveedores = signal<Proveedor[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.comprasService.getProveedores().subscribe((proveedores) => this.proveedores.set(proveedores));
    this.comprasService.getCompras().subscribe({
      next: (compras) => {
        this.compras.set(compras);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las compras.');
        this.loading.set(false);
      },
    });
  }

  proveedorNombre(id: number): string {
    return this.proveedores().find((p) => p.id === id)?.nombre ?? '—';
  }

  estadoLabel(estado: string): string {
    return ESTADOS_COMPRA.find((e) => e.value === estado)?.label ?? estado;
  }

  total(compra: Compra): number {
    return compra.detalles.reduce((suma, d) => suma + d.cantidad * Number(d.costo_unitario), 0);
  }
}
