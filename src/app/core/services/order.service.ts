import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pedido, PedidoInput } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pedidos/pedidos`;

  crearPedido(pedido: PedidoInput): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.baseUrl}/`, pedido);
  }
}
