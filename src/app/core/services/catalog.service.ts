import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria, Marca, Producto, ProductoInput } from '../models/catalog.model';
import { Pais, Region } from '../models/ubicacion.model';

export interface ProductoFiltros {
  categoria?: number | null;
  marca?: number | null;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/catalogo`;

  getProductos(filtros?: ProductoFiltros): Observable<Producto[]> {
    let params = new HttpParams();
    if (filtros?.categoria) {
      params = params.set('categorias', filtros.categoria);
    }
    if (filtros?.marca) {
      params = params.set('marca', filtros.marca);
    }
    return this.http.get<Producto[]>(`${this.baseUrl}/productos/`, { params });
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/productos/${id}/`);
  }

  createProducto(producto: ProductoInput): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/productos/`, producto);
  }

  updateProducto(id: number, producto: ProductoInput): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/productos/${id}/`, producto);
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/productos/${id}/`);
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.baseUrl}/categorias/`);
  }

  getMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(`${this.baseUrl}/marcas/`);
  }

  getPaises(): Observable<Pais[]> {
    return this.http.get<Pais[]>(`${environment.apiUrl}/ubicaciones/paises/`);
  }

  getRegiones(paisId?: number): Observable<Region[]> {
    let params = new HttpParams();
    if (paisId) {
      params = params.set('pais', paisId);
    }
    return this.http.get<Region[]>(`${environment.apiUrl}/ubicaciones/regiones/`, { params });
  }
}
