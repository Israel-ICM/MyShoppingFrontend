import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuario-list',
  imports: [RouterLink],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.scss',
})
export class UsuarioListComponent {
  private readonly usuariosService = inject(UsuariosService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los usuarios.');
        this.loading.set(false);
      },
    });
  }

  nombreCompleto(usuario: Usuario): string {
    const nombre = `${usuario.first_name} ${usuario.last_name}`.trim();
    return nombre || '—';
  }
}
