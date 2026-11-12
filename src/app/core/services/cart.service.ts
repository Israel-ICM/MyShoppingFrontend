import { Injectable, computed, signal } from '@angular/core';

export interface CartLine {
  productoId: number;
  cantidad: number;
}

const STORAGE_KEY = 'myshopping-order';

/** Carrito de la tienda pública, persistido en localStorage igual que el sitio anterior. */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly lines = signal<CartLine[]>(this.readStorage());

  readonly items = this.lines.asReadonly();
  readonly totalItems = computed(() => this.lines().reduce((sum, l) => sum + l.cantidad, 0));

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

  add(productoId: number): void {
    const current = this.lines();
    const existente = current.find((l) => l.productoId === productoId);
    const siguiente = existente
      ? current.map((l) => (l.productoId === productoId ? { ...l, cantidad: l.cantidad + 1 } : l))
      : [...current, { productoId, cantidad: 1 }];
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
