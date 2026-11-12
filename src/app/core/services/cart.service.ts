import { Injectable, computed, inject, signal } from '@angular/core';
import { Producto } from '../models/catalog.model';
import { ToastService } from './toast.service';

export interface CartLine {
  productoId: number;
  cantidad: number;
}

const STORAGE_KEY = 'myshopping-order';

/** Carrito de la tienda pública, persistido en localStorage igual que el sitio anterior. */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly toast = inject(ToastService);

  private readonly lines = signal<CartLine[]>(this.readStorage());

  readonly items = this.lines.asReadonly();
  readonly totalItems = computed(() => this.lines().reduce((sum, l) => sum + l.cantidad, 0));

  isInOrder(productoId: number): boolean {
    return this.lines().some((l) => l.productoId === productoId);
  }

  cantidadDe(productoId: number): number {
    return this.lines().find((l) => l.productoId === productoId)?.cantidad ?? 0;
  }

  /** Agrega un producto validando stock disponible; muestra toast de éxito (con deshacer) o de error. */
  intentarAgregar(producto: Producto, cantidad = 1): void {
    const actual = this.cantidadDe(producto.id);
    const disponible = producto.stock - actual;
    if (cantidad > disponible) {
      if (disponible <= 0) {
        this.toast.mostrar('Este producto no tiene stock disponible');
      } else {
        this.toast.mostrar(
          `Solo tenemos ${disponible} unidad${disponible === 1 ? '' : 'es'} disponible${disponible === 1 ? '' : 's'} de este producto`,
        );
      }
      return;
    }
    this.add(producto.id, cantidad);
    this.toast.mostrar('Producto agregado al pedido', () => this.decrementarUno(producto.id));
  }

  decrementarUno(productoId: number): void {
    const current = this.lines();
    const existente = current.find((l) => l.productoId === productoId);
    if (!existente) {
      return;
    }
    const siguiente =
      existente.cantidad <= 1
        ? current.filter((l) => l.productoId !== productoId)
        : current.map((l) => (l.productoId === productoId ? { ...l, cantidad: l.cantidad - 1 } : l));
    this.lines.set(siguiente);
    this.persist(siguiente);
  }

  private readStorage(): CartLine[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private persist(lines: CartLine[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }

  add(productoId: number, cantidad = 1): void {
    const current = this.lines();
    const existente = current.find((l) => l.productoId === productoId);
    const siguiente = existente
      ? current.map((l) => (l.productoId === productoId ? { ...l, cantidad: l.cantidad + cantidad } : l))
      : [...current, { productoId, cantidad }];
    this.lines.set(siguiente);
    this.persist(siguiente);
  }

  setCantidad(productoId: number, cantidad: number): void {
    if (cantidad <= 0) {
      this.remove(productoId);
      return;
    }
    const siguiente = this.lines().map((l) =>
      l.productoId === productoId ? { ...l, cantidad } : l,
    );
    this.lines.set(siguiente);
    this.persist(siguiente);
  }

  remove(productoId: number): void {
    const siguiente = this.lines().filter((l) => l.productoId !== productoId);
    this.lines.set(siguiente);
    this.persist(siguiente);
  }

  clear(): void {
    this.lines.set([]);
    this.persist([]);
  }
}
