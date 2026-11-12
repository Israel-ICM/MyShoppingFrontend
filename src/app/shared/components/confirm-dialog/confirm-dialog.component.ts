import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../../core/services/confirm.service';

/** Diálogo de confirmación global de la tienda pública (quitar producto del pedido, etc.). */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  protected readonly confirm = inject(ConfirmService);
}
