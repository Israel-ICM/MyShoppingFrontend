import { Injectable, signal } from '@angular/core';

export interface ToastState {
  mensaje: string;
  onRevertir?: () => void;
}

const DURACION_MS = 4000;

/** Notificaciones breves en la tienda pública, igual que el sistema anterior (toast con opción de deshacer). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly estado = signal<ToastState | null>(null);
  private temporizador?: ReturnType<typeof setTimeout>;

  mostrar(mensaje: string, onRevertir?: () => void): void {
    clearTimeout(this.temporizador);
    this.estado.set({ mensaje, onRevertir });
    this.temporizador = setTimeout(() => this.estado.set(null), DURACION_MS);
  }

  revertir(): void {
    const actual = this.estado();
    clearTimeout(this.temporizador);
    this.estado.set(null);
    actual?.onRevertir?.();
  }
}
