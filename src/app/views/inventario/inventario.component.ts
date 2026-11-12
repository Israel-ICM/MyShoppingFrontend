import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventarioService } from '../../core/services/inventario.service';
import { CatalogService } from '../../core/services/catalog.service';
import { LoteInventario, MovimientoStock, TIPOS_MOVIMIENTO } from '../../core/models/inventario.model';
import { Producto } from '../../core/models/catalog.model';
import { FilterSelectComponent } from '../../shared/components/filter-select/filter-select.component';

type Pestana = 'movimientos' | 'lotes';

@Component({
  selector: 'app-inventario',
  imports: [ReactiveFormsModule, DatePipe, FilterSelectComponent],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss',
})
export class InventarioComponent {
  private readonly inventarioService = inject(InventarioService);
  private readonly catalogService = inject(CatalogService);

  readonly tiposMovimiento = TIPOS_MOVIMIENTO;
  readonly pestana = signal<Pestana>('movimientos');

  readonly tiposAjuste = [
    { id: 'AJ', nombre: 'Ajuste' },
    { id: 'MR', nombre: 'Merma' },
    { id: 'DV', nombre: 'Devolución' },
  ];

  readonly direcciones = [
    { id: 'entrada', nombre: 'Entrada (+)' },
    { id: 'salida', nombre: 'Salida (−)' },
  ];

  readonly productos = signal<Producto[]>([]);
  readonly movimientos = signal<MovimientoStock[]>([]);
  readonly lotes = signal<LoteInventario[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly mostrarAjuste = signal(false);
  readonly guardandoAjuste = signal(false);
  readonly erorrAjuste = signal<string | null>(null);

  readonly ajusteForm = new FormGroup({
    producto: new FormControl<number | null>(null, { validators: [Validators.required] }),
    tipo: new FormControl<'AJ' | 'DV' | 'MR'>('AJ', { nonNullable: true }),
    direccion: new FormControl<'entrada' | 'salida'>('entrada', { nonNullable: true }),
    cantidad: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    observacion: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.catalogService.getProductos().subscribe((productos) => this.productos.set(productos));
    this.cargarMovimientos();
    this.cargarLotes();
  }

  cambiarPestana(pestana: Pestana): void {
    this.pestana.set(pestana);
  }

  private cargarMovimientos(): void {
    this.loading.set(true);
    this.inventarioService.getMovimientos().subscribe({
      next: (movimientos) => {
        this.movimientos.set(movimientos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los movimientos.');
        this.loading.set(false);
      },
    });
  }

  private cargarLotes(): void {
    this.inventarioService.getLotes().subscribe((lotes) => this.lotes.set(lotes));
  }

  tipoLabel(tipo: string): string {
    return this.tiposMovimiento.find((t) => t.value === tipo)?.label ?? tipo;
  }

  diasParaVencer(fecha: string): number {
    const hoy = new Date();
    const vencimiento = new Date(fecha);
    return Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }

  toggleAjuste(): void {
    this.mostrarAjuste.update((v) => !v);
  }

  registrarAjuste(): void {
    if (this.ajusteForm.invalid) {
      this.ajusteForm.markAllAsTouched();
      return;
    }

    this.guardandoAjuste.set(true);
    this.erorrAjuste.set(null);

    const valores = this.ajusteForm.getRawValue();
    const cantidadFirmada = valores.direccion === 'salida' ? -Math.abs(valores.cantidad) : Math.abs(valores.cantidad);

    this.inventarioService
      .crearAjuste({
        producto: valores.producto as number,
        tipo: valores.tipo,
        cantidad: cantidadFirmada,
        observacion: valores.observacion,
      })
      .subscribe({
        next: () => {
          this.guardandoAjuste.set(false);
          this.mostrarAjuste.set(false);
          this.ajusteForm.reset({ tipo: 'AJ', direccion: 'entrada', cantidad: 1, observacion: '' });
          this.cargarMovimientos();
        },
        error: () => {
          this.guardandoAjuste.set(false);
          this.erorrAjuste.set('No se pudo registrar el ajuste.');
        },
      });
  }
}
