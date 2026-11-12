import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

export interface ReciboLinea {
  nombre: string;
  cantidad: number;
  precio: string;
}

export interface ReciboPedido {
  id: number;
  clienteNombre: string;
  clienteTelefono: string;
  lineas: ReciboLinea[];
  total: number;
}

/** Genera el PDF de confirmación de pedido, igual que el sitio anterior. */
@Injectable({ providedIn: 'root' })
export class OrderReceiptService {
  descargar(pedido: ReciboPedido): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a5' });
    let y = 18;

    doc.setFontSize(16);
    doc.text('MyShopping', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.text(`Pedido #${pedido.id}`, 14, y);
    y += 6;
    doc.text(`Cliente: ${pedido.clienteNombre}`, 14, y);
    y += 6;
    doc.text(`Celular: ${pedido.clienteTelefono}`, 14, y);
    y += 10;

    doc.setFontSize(11);
    doc.text('Productos', 14, y);
    y += 6;

    doc.setFontSize(9);
    for (const linea of pedido.lineas) {
      doc.text(`${linea.cantidad} x ${linea.nombre}`, 14, y);
      doc.text(`Bs ${linea.precio}`, 85, y);
      y += 6;
    }

    y += 4;
    doc.setFontSize(11);
    doc.text(`Total: Bs ${pedido.total.toFixed(2)}`, 14, y);

    doc.save(`pedido-${pedido.id}.pdf`);
  }
}
