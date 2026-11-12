import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ComprasService } from '../../../core/services/compras.service';
import { Proveedor } from '../../../core/models/compra.model';

@Component({
  selector: 'app-proveedor-list',
  imports: [RouterLink],
  templateUrl: './proveedor-list.component.html',
  styleUrl: './proveedor-list.component.scss',
})
export class ProveedorListComponent {
  private readonly comprasService = inject(ComprasService);

  readonly proveedores = signal<Proveedor[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.comprasService.getProveedores().subscribe({
      next: (proveedores) => {
        this.proveedores.set(proveedores);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los proveedores.');
        this.loading.set(false);
      },
    });
  }
}
