import { Component, input, output, signal } from '@angular/core';
import { Producto } from '../../../core/models/catalog.model';

const TREINTA_DIAS_MS = 30 * 24 * 60 * 60 * 1000;
const NUMERO_WHATSAPP_DEFAULT = '59163053155';

/** Card de producto del catálogo público: foto, marca, precio, agregar y compartir. */
@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  readonly producto = input.required<Producto>();
  readonly agregar = output<Producto>();

  protected readonly shareModalOpen = signal(false);
  protected readonly numeroWhatsapp = signal(NUMERO_WHATSAPP_DEFAULT);

  private get enlaceProducto(): string {
    return `${location.origin}/?producto=${this.producto().id}`;
  }

  compartir(): void {
    const nombre = this.producto().nombre;
    const url = this.enlaceProducto;

    if (navigator.share) {
      navigator.share({ title: nombre, text: url, url }).catch(() => {});
      return;
    }

    this.numeroWhatsapp.set(NUMERO_WHATSAPP_DEFAULT);
    this.shareModalOpen.set(true);
  }

  cerrarShare(): void {
    this.shareModalOpen.set(false);
  }

  onNumeroWhatsappChange(event: Event): void {
    this.numeroWhatsapp.set((event.target as HTMLInputElement).value);
  }

  enviarShare(): void {
    const digitos = this.numeroWhatsapp().replace(/\D/g, '');
    if (digitos.length < 8) {
      return;
    }
    this.shareModalOpen.set(false);
    const texto = encodeURIComponent(this.enlaceProducto);
    window.open(`https://wa.me/${digitos}?text=${texto}`, '_blank');
  }

  get imagen(): string {
    const fotos = this.producto().fotos ?? [];
    const principal = fotos.find((f) => f.principal) ?? fotos[0];
    return principal?.url ?? '';
  }

  get sinStock(): boolean {
    return this.producto().stock <= 0;
  }

  get esNuevo(): boolean {
    const creado = new Date(this.producto().creado_en).getTime();
    return Date.now() - creado < TREINTA_DIAS_MS;
  }
}
