import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ComprasService } from '../../../core/services/compras.service';
import { ProveedorInput } from '../../../core/models/compra.model';

@Component({
  selector: 'app-proveedor-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './proveedor-form.component.html',
  styleUrl: './proveedor-form.component.scss',
})
export class ProveedorFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly comprasService = inject(ComprasService);

  private readonly proveedorId = this.route.snapshot.paramMap.get('id');
  readonly isEdit = this.proveedorId !== null;

  readonly loading = signal(this.isEdit);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    web: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    telefono: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    if (this.proveedorId) {
      this.comprasService.getProveedor(Number(this.proveedorId)).subscribe({
        next: (proveedor) => {
          this.form.patchValue(proveedor);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el proveedor.');
          this.loading.set(false);
        },
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const proveedor: ProveedorInput = this.form.getRawValue();
    const request$ = this.isEdit
      ? this.comprasService.updateProveedor(Number(this.proveedorId), proveedor)
      : this.comprasService.createProveedor(proveedor);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/compras/proveedores']);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('No se pudo guardar el proveedor.');
      },
    });
  }
}
