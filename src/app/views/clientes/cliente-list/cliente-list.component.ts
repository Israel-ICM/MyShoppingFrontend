import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClientesService } from '../../../core/services/clientes.service';
import { Cliente } from '../../../core/models/cliente.model';

@Component({
  selector: 'app-cliente-list',
  imports: [RouterLink],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.scss',
})
export class ClienteListComponent {
  private readonly clientesService = inject(ClientesService);

  readonly clientes = signal<Cliente[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.clientesService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los clientes.');
        this.loading.set(false);
      },
    });
  }
}
