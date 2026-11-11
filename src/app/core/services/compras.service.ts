import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Compra,
  CompraInput,
  DetalleCompra,
  EstadoCompra,
  NuevoDetalleCompra,
  Proveedor,
  ProveedorInput,
} from '../models/compra.model';

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/compras`;

  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.baseUrl}/proveedores/`);
  }

  getProveedor(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.baseUrl}/proveedores/${id}/`);
  }

  createProveedor(proveedor: ProveedorInput): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${this.baseUrl}/proveedores/`, proveedor);
  }

  updateProveedor(id: number, proveedor: ProveedorInput): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.baseUrl}/proveedores/${id}/`, proveedor);
  }

  deleteProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/proveedores/${id}/`);
  }

  getCompras(): Observable<Compra[]> {
    return this.http.get<Compra[]>(`${this.baseUrl}/compras/`);
  }

  getCompra(id: number): Observable<Compra> {
    return this.http.get<Compra>(`${this.baseUrl}/compras/${id}/`);
  }

  /** Crea la compra y todos sus detalles en un único POST atómico (ver serializer del backend). */
  createCompra(compra: CompraInput): Observable<Compra> {
    return this.http.post<Compra>(`${this.baseUrl}/compras/`, compra);
  }

  updateCompraEstado(id: number, estado: EstadoCompra): Observable<Compra> {
    return this.http.patch<Compra>(`${this.baseUrl}/compras/${id}/`, { estado });
  }

  deleteCompra(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/compras/${id}/`);
  }

  /** Agrega una línea a una compra que ya existe. */
  createDetalle(detalle: NuevoDetalleCompra): Observable<DetalleCompra> {
    return this.http.post<DetalleCompra>(`${this.baseUrl}/detalles-compra/`, detalle);
  }

  deleteDetalle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/detalles-compra/${id}/`);
  }
}
