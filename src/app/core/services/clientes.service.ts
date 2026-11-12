import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente, ClienteInput } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/cuentas`;

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.baseUrl}/clientes/`);
  }

  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/clientes/${id}/`);
  }

  createCliente(cliente: ClienteInput): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/clientes/`, cliente);
  }

  updateCliente(id: number, cliente: ClienteInput): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/clientes/${id}/`, cliente);
  }

  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clientes/${id}/`);
  }
}
