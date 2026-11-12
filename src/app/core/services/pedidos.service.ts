import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadoPedido, Pedido } from '../models/pedido.model';

export interface PedidoFiltros {
  estado?: EstadoPedido | null;
}

/** Lectura y gestión de pedidos desde el panel admin (la creación la hace el cliente desde la tienda). */
@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pedidos`;

  getPedidos(filtros?: PedidoFiltros): Observable<Pedido[]> {
    let params = new HttpParams();
    if (filtros?.estado) {
      params = params.set('estado', filtros.estado);
    }
    return this.http.get<Pedido[]>(`${this.baseUrl}/pedidos/`, { params });
  }

  getPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.baseUrl}/pedidos/${id}/`);
  }

  updateEstado(id: number, estado: EstadoPedido): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.baseUrl}/pedidos/${id}/`, { estado });
  }
}
