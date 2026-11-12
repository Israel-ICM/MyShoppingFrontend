import { Injectable, signal } from '@angular/core';

export interface ConfirmState {
  mensaje: string;
  onConfirmar: () => void;
}

/** Diálogo de confirmación global de la tienda pública, igual que el sistema anterior. */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly estado = signal<ConfirmState | null>(null);

  preguntar(mensaje: string, onConfirmar: () => void): void {
    this.estado.set({ mensaje, onConfirmar });
  }

  confirmar(): void {
    this.estado()?.onConfirmar();
    this.estado.set(null);
  }

  cancelar(): void {
    this.estado.set(null);
  }
}
