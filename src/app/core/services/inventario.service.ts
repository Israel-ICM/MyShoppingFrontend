import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AjusteStockInput, LoteInventario, MovimientoStock } from '../models/inventario.model';

export interface MovimientoFiltros {
  producto?: number | null;
  tipo?: string | null;
}

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/inventarios`;

  getMovimientos(filtros?: MovimientoFiltros): Observable<MovimientoStock[]> {
    let params = new HttpParams();
    if (filtros?.producto) {
      params = params.set('producto', filtros.producto);
    }
    if (filtros?.tipo) {
      params = params.set('tipo', filtros.tipo);
    }
    return this.http.get<MovimientoStock[]>(`${this.baseUrl}/movimientos-stock/`, { params });
  }

  crearAjuste(ajuste: AjusteStockInput): Observable<MovimientoStock> {
    return this.http.post<MovimientoStock>(`${this.baseUrl}/movimientos-stock/`, ajuste);
  }

  getLotes(): Observable<LoteInventario[]> {
    return this.http.get<LoteInventario[]>(`${this.baseUrl}/lotes-inventario/`);
  }
}
