import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pago, PagoInput } from '../models/pago.model';

@Injectable({ providedIn: 'root' })
export class PagosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pagos`;

  getPagos(pedidoId: number): Observable<Pago[]> {
    const params = new HttpParams().set('pedido', pedidoId);
    return this.http.get<Pago[]>(`${this.baseUrl}/pagos/`, { params });
  }

  crearPago(pago: PagoInput): Observable<Pago> {
    return this.http.post<Pago>(`${this.baseUrl}/pagos/`, pago);
  }
}
