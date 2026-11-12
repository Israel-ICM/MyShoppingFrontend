import { Injectable, signal } from '@angular/core';

export type FiltroTipo = 'marca' | 'categoria' | 'novedades';

export interface FiltroActivo {
  tipo: FiltroTipo;
  id: number | null;
  etiqueta: string;
}

/** Filtro activo del catálogo público (marca, categoría o novedades), compartido entre header y home. */
@Injectable({ providedIn: 'root' })
export class StoreFilterService {
  readonly filtro = signal<FiltroActivo | null>(null);

  setMarca(id: number, nombre: string): void {
    this.filtro.set({ tipo: 'marca', id, etiqueta: nombre });
  }

  setCategoria(id: number, nombre: string): void {
    this.filtro.set({ tipo: 'categoria', id, etiqueta: nombre });
  }

  setNovedades(dias: number): void {
    this.filtro.set({ tipo: 'novedades', id: null, etiqueta: `${dias} días` });
  }

  limpiar(): void {
    this.filtro.set(null);
  }
}
