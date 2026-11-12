import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ComprasService } from '../../../core/services/compras.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { Compra, ESTADOS_COMPRA, Proveedor } from '../../../core/models/compra.model';
import { Producto } from '../../../core/models/catalog.model';

@Component({
  selector: 'app-compra-detail',
  imports: [RouterLink, ReactiveFormsModule, DatePipe],
  templateUrl: './compra-detail.component.html',
  styleUrl: './compra-detail.component.scss',
})
export class CompraDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly comprasService = inject(ComprasService);
  private readonly catalogService = inject(CatalogService);

  private readonly compraId = Number(this.route.snapshot.paramMap.get('id'));

  readonly compra = signal<Compra | null>(null);
  readonly proveedores = signal<Proveedor[]>([]);
  readonly productos = signal<Producto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly recibiendoForm = signal(false);
  readonly guardando = signal(false);
  readonly vencimientos = new FormGroup<Record<string, FormControl<string>>>({});

  readonly total = computed(() => {
    const compra = this.compra();
    if (!compra) {
      return 0;
    }
    return compra.detalles.reduce((suma, d) => suma + d.cantidad * Number(d.costo_unitario), 0);
  });

  constructor() {
    this.comprasService.getProveedores().subscribe((proveedores) => this.proveedores.set(proveedores));
    this.catalogService.getProductos().subscribe((productos) => this.productos.set(productos));
    this.cargarCompra();
  }

  private cargarCompra(): void {
    this.comprasService.getCompra(this.compraId).subscribe({
      next: (compra) => {
        this.compra.set(compra);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la compra.');
        this.loading.set(false);
      },
    });
  }

  proveedorNombre(id: number): string {
    return this.proveedores().find((p) => p.id === id)?.nombre ?? '—';
  }

  productoNombre(id: number): string {
    return this.productos().find((p) => p.id === id)?.nombre ?? '—';
  }

  estadoLabel(estado: string): string {
    return ESTADOS_COMPRA.find((e) => e.value === estado)?.label ?? estado;
  }

  iniciarRecepcion(): void {
    const compra = this.compra();
    if (!compra) {
      return;
    }
    const unAnioDesdeHoy = new Date();
    unAnioDesdeHoy.setFullYear(unAnioDesdeHoy.getFullYear() + 1);
    const sugerida = unAnioDesdeHoy.toISOString().slice(0, 10);

    for (const detalle of compra.detalles) {
      this.vencimientos.addControl(
        String(detalle.id),
        new FormControl(sugerida, { nonNullable: true, validators: [Validators.required] }),
      );
    }
    this.recibiendoForm.set(true);
  }

  cancelarRecepcion(): void {
    this.recibiendoForm.set(false);
  }

  confirmarRecepcion(): void {
    const compra = this.compra();
    if (!compra || this.vencimientos.invalid) {
      this.vencimientos.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const lotes = compra.detalles.map((detalle) => ({
      detalle: detalle.id,
      fecha_vencimiento: this.vencimientos.controls[String(detalle.id)].value,
    }));

    this.comprasService.recibirCompra(compra.id, { lotes }).subscribe({
      next: (actualizada) => {
        this.compra.set(actualizada);
        this.recibiendoForm.set(false);
        this.guardando.set(false);
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('No se pudo recibir la compra.');
      },
    });
  }

  cancelarCompra(): void {
    const compra = this.compra();
    if (!compra) {
      return;
    }
    this.comprasService.updateCompraEstado(compra.id, 'CA').subscribe({
      next: (actualizada) => this.compra.set(actualizada),
      error: () => this.error.set('No se pudo cancelar la compra.'),
    });
  }
}
