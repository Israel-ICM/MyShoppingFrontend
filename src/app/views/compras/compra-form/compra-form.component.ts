import { Component, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ComprasService } from '../../../core/services/compras.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { CompraInput, Proveedor } from '../../../core/models/compra.model';
import { Producto } from '../../../core/models/catalog.model';
import { FilterSelectComponent } from '../../../shared/components/filter-select/filter-select.component';

type DetalleForm = FormGroup<{
  producto: FormControl<number | null>;
  cantidad: FormControl<number>;
  costo_unitario: FormControl<number>;
}>;

@Component({
  selector: 'app-compra-form',
  imports: [ReactiveFormsModule, RouterLink, FilterSelectComponent],
  templateUrl: './compra-form.component.html',
  styleUrl: './compra-form.component.scss',
})
export class CompraFormComponent {
  private readonly router = inject(Router);
  private readonly comprasService = inject(ComprasService);
  private readonly catalogService = inject(CatalogService);

  readonly proveedores = signal<Proveedor[]>([]);
  readonly productos = signal<Producto[]>([]);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly detalles = new FormArray<DetalleForm>([]);

  readonly form = new FormGroup({
    proveedor: new FormControl<number | null>(null, { validators: [Validators.required] }),
    detalles: this.detalles,
  });

  get proveedor(): FormControl<number | null> {
    return this.form.controls.proveedor;
  }

  constructor() {
    this.comprasService.getProveedores().subscribe((proveedores) => this.proveedores.set(proveedores));
    this.catalogService.getProductos().subscribe((productos) => this.productos.set(productos));
    this.agregarLinea();
  }

  private nuevaLinea(): DetalleForm {
    return new FormGroup({
      producto: new FormControl<number | null>(null, { validators: [Validators.required] }),
      cantidad: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
      costo_unitario: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    });
  }

  agregarLinea(): void {
    this.detalles.push(this.nuevaLinea());
  }

  quitarLinea(index: number): void {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(index);
    }
  }

  productoNombre(id: number | null): string {
    return this.productos().find((p) => p.id === id)?.nombre ?? '';
  }

  get total(): number {
    return this.detalles.controls.reduce(
      (suma, linea) => suma + linea.controls.cantidad.value * linea.controls.costo_unitario.value,
      0,
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const compra: CompraInput = {
      proveedor: this.proveedor.value as number,
      estado: 'PE',
      detalles: this.detalles.controls.map((linea) => ({
        producto: linea.controls.producto.value as number,
        cantidad: linea.controls.cantidad.value,
        costo_unitario: String(linea.controls.costo_unitario.value),
      })),
    };

    this.comprasService.createCompra(compra).subscribe({
      next: (creada) => {
        this.saving.set(false);
        this.router.navigate(['/admin/compras', creada.id]);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('No se pudo registrar la compra.');
      },
    });
  }
}
