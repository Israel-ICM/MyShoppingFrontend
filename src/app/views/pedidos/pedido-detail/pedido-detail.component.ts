import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PedidosService } from '../../../core/services/pedidos.service';
import { PagosService } from '../../../core/services/pagos.service';
import { ESTADOS_PEDIDO, Pedido } from '../../../core/models/pedido.model';
import { ESTADOS_PAGO, METODOS_PAGO, MetodoPago, Pago } from '../../../core/models/pago.model';
import { FilterSelectComponent } from '../../../shared/components/filter-select/filter-select.component';

@Component({
  selector: 'app-pedido-detail',
  imports: [RouterLink, ReactiveFormsModule, DatePipe, FilterSelectComponent],
  templateUrl: './pedido-detail.component.html',
  styleUrl: './pedido-detail.component.scss',
})
export class PedidoDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly pedidosService = inject(PedidosService);
  private readonly pagosService = inject(PagosService);

  private readonly pedidoId = Number(this.route.snapshot.paramMap.get('id'));

  readonly estadosPedido = ESTADOS_PEDIDO;
  readonly metodosPago = METODOS_PAGO;
  readonly estadosPago = ESTADOS_PAGO;
  readonly opcionesMetodo = METODOS_PAGO.map((m) => ({ id: m.value, nombre: m.label }));

  readonly pedido = signal<Pedido | null>(null);
  readonly pagos = signal<Pago[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly mostrarForm = signal(false);
  readonly guardando = signal(false);
  readonly errorPago = signal<string | null>(null);

  readonly puedeRegistrarPago = computed(() => {
    const pedido = this.pedido();
    return !!pedido && pedido.estado !== 'CA' && +pedido.saldo_pendiente > 0;
  });

  readonly form = new FormGroup({
    monto: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
    metodo: new FormControl<MetodoPago>('EF', { nonNullable: true }),
    referencia_externa: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.cargarPedido();
    this.cargarPagos();
  }

  private cargarPedido(): void {
    this.pedidosService.getPedido(this.pedidoId).subscribe({
      next: (pedido) => {
        this.pedido.set(pedido);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el pedido.');
        this.loading.set(false);
      },
    });
  }

  private cargarPagos(): void {
    this.pagosService.getPagos(this.pedidoId).subscribe((pagos) => this.pagos.set(pagos));
  }

  estadoPedidoLabel(estado: string): string {
    return this.estadosPedido.find((e) => e.value === estado)?.label ?? estado;
  }

  metodoLabel(metodo: string): string {
    return this.metodosPago.find((m) => m.value === metodo)?.label ?? metodo;
  }

  estadoPagoLabel(estado: string): string {
    return this.estadosPago.find((e) => e.value === estado)?.label ?? estado;
  }

  abrirFormPago(): void {
    const pedido = this.pedido();
    this.form.reset({ monto: pedido ? +pedido.saldo_pendiente : 0, metodo: 'EF', referencia_externa: '' });
    this.mostrarForm.set(true);
  }

  cerrarFormPago(): void {
    this.mostrarForm.set(false);
  }

  registrarPago(): void {
    const pedido = this.pedido();
    if (!pedido || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorPago.set(null);

    const valores = this.form.getRawValue();

    this.pagosService
      .crearPago({
        pedido: pedido.id,
        monto: String(valores.monto),
        metodo: valores.metodo,
        estado: 'CO',
        referencia_externa: valores.referencia_externa,
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.mostrarForm.set(false);
          this.cargarPedido();
          this.cargarPagos();
        },
        error: (err) => {
          this.guardando.set(false);
          const detalle = err?.error?.non_field_errors?.[0];
          this.errorPago.set(detalle ?? 'No se pudo registrar el pago.');
        },
      });
  }
}
