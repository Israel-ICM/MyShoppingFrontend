import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { UsuarioInput } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.scss',
})
export class UsuarioFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usuariosService = inject(UsuariosService);

  private readonly usuarioId = this.route.snapshot.paramMap.get('id');
  readonly isEdit = this.usuarioId !== null;

  readonly loading = signal(this.isEdit);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    first_name: new FormControl('', { nonNullable: true }),
    last_name: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
    is_active: new FormControl(true, { nonNullable: true }),
    is_staff: new FormControl(false, { nonNullable: true }),
  });

  constructor() {
    if (this.usuarioId) {
      this.usuariosService.getUsuario(Number(this.usuarioId)).subscribe({
        next: (usuario) => {
          this.form.patchValue(usuario);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el usuario.');
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

    const usuario: UsuarioInput = this.form.getRawValue();
    if (!usuario.password) {
      delete usuario.password;
    }

    const request$ = this.isEdit
      ? this.usuariosService.updateUsuario(Number(this.usuarioId), usuario)
      : this.usuariosService.createUsuario(usuario);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/usuarios']);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('No se pudo guardar el usuario.');
      },
    });
  }
}
