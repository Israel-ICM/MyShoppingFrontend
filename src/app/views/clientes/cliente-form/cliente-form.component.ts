import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientesService } from '../../../core/services/clientes.service';
import { ClienteInput } from '../../../core/models/cliente.model';

@Component({
  selector: 'app-cliente-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.scss',
})
export class ClienteFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientesService = inject(ClientesService);

  private readonly clienteId = this.route.snapshot.paramMap.get('id');
  readonly isEdit = this.clienteId !== null;

  readonly loading = signal(this.isEdit);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true }),
    telefono: new FormControl('', { nonNullable: true }),
    direccion: new FormControl('', { nonNullable: true }),
    usuario: new FormControl<number | null>(null),
  });

  constructor() {
    if (this.clienteId) {
      this.clientesService.getCliente(Number(this.clienteId)).subscribe({
        next: (cliente) => {
          this.form.patchValue(cliente);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el cliente.');
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

    const cliente: ClienteInput = this.form.getRawValue();
    const request$ = this.isEdit
      ? this.clientesService.updateCliente(Number(this.clienteId), cliente)
      : this.clientesService.createCliente(cliente);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/clientes']);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('No se pudo guardar el cliente.');
      },
    });
  }
}
