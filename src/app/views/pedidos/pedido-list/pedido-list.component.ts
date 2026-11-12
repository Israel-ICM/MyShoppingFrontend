import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PedidosService } from '../../../core/services/pedidos.service';
import { EstadoPedido, ESTADOS_PEDIDO, Pedido } from '../../../core/models/pedido.model';
import { FilterSelectComponent } from '../../../shared/components/filter-select/filter-select.component';

@Component({
  selector: 'app-pedido-list',
  imports: [RouterLink, DatePipe, FilterSelectComponent],
  templateUrl: './pedido-list.component.html',
  styleUrl: './pedido-list.component.scss',
})
export class PedidoListComponent {
  private readonly pedidosService = inject(PedidosService);

  readonly estados = ESTADOS_PEDIDO;
  readonly opcionesEstado = ESTADOS_PEDIDO.map((e) => ({ id: e.value, nombre: e.label }));
  readonly estadoFiltro = signal<EstadoPedido | null>(null);
  readonly pedidos = signal<Pedido[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  onEstadoChange(value: string | number | null): void {
    this.estadoFiltro.set(value === null ? null : (value as EstadoPedido));
    this.cargar();
  }

  estadoLabel(estado: string): string {
    return this.estados.find((e) => e.value === estado)?.label ?? estado;
  }

  private cargar(): void {
    this.loading.set(true);
    this.pedidosService.getPedidos({ estado: this.estadoFiltro() }).subscribe({
      next: (pedidos) => {
        this.pedidos.set(pedidos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los pedidos.');
        this.loading.set(false);
      },
    });
  }
}
