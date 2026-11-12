import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

/** Toast global de la tienda pública: confirma acciones del carrito con opción de deshacer. */
@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  protected readonly toast = inject(ToastService);
}
