import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Producto } from '../../../core/models/catalog.model';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';

const DURACION_MORPH_MS = 550;
const DURACION_CIERRE_MS = 400;

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Vista previa de producto: carousel de imágenes, stepper de cantidad y agregar al pedido.
 * Se abre/cierra con una animación "morph" desde la card de origen, igual que el sistema anterior.
 */
@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrl: './product-modal.component.scss',
})
export class ProductModalComponent implements AfterViewInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  readonly producto = input.required<Producto>();
  readonly origen = input<HTMLElement | null>(null);
  readonly categoriaNombre = input<string>('');
  readonly cerrar = output<void>();

  protected readonly abierto = signal(false);
  protected readonly listo = signal(false);
  protected readonly cerrando = signal(false);
  protected readonly slideActual = signal(0);
  protected readonly cantidad = signal(1);
  protected readonly lightboxUrl = signal<string | null>(null);

  protected readonly fotos = computed(() => this.producto().fotos);
  protected readonly enOrden = computed(() => this.cart.isInOrder(this.producto().id));

  ngAfterViewInit(): void {
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => this.abierto.set(true));

    const origen = this.origen();
    const contenido = this.elementRef.nativeElement.querySelector('.modal-content') as HTMLElement | null;

    if (!origen || !contenido || reducedMotion()) {
      this.listo.set(true);
      return;
    }

    const cardRect = origen.getBoundingClientRect();
    const clone = origen.cloneNode(true) as HTMLElement;
    clone.style.cssText = `position:fixed; left:${cardRect.left}px; top:${cardRect.top}px; width:${cardRect.width}px; height:${cardRect.height}px; margin:0; z-index:2002; transition: left 0.5s cubic-bezier(0.34,1.56,0.64,1), top 0.5s cubic-bezier(0.34,1.56,0.64,1), width 0.5s cubic-bezier(0.34,1.56,0.64,1), height 0.5s cubic-bezier(0.34,1.56,0.64,1), border-radius 0.5s cubic-bezier(0.34,1.56,0.64,1);`;
    document.body.appendChild(clone);
    origen.style.opacity = '0';

    const targetRect = contenido.getBoundingClientRect();
    clone.offsetHeight;
    clone.style.left = `${targetRect.left}px`;
    clone.style.top = `${targetRect.top}px`;
    clone.style.width = `${targetRect.width}px`;
    clone.style.height = `${targetRect.height}px`;

    let revelado = false;
    const revelar = () => {
      if (revelado) {
        return;
      }
      revelado = true;
      clone.remove();
      this.listo.set(true);
    };
    clone.addEventListener('transitionend', revelar, { once: true });
    setTimeout(revelar, DURACION_MORPH_MS);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.solicitarCierre();
  }

  anterior(): void {
    const total = this.fotos().length;
    this.slideActual.set((this.slideActual() - 1 + total) % total);
  }

  siguiente(): void {
    const total = this.fotos().length;
    this.slideActual.set((this.slideActual() + 1) % total);
  }

  irAFoto(index: number): void {
    this.slideActual.set(index);
  }

  abrirLightbox(): void {
    this.lightboxUrl.set(this.fotos()[this.slideActual()]?.url ?? null);
  }

  cerrarLightbox(): void {
    this.lightboxUrl.set(null);
  }

  disminuir(): void {
    if (this.cantidad() > 1) {
      this.cantidad.update((v) => v - 1);
    }
  }

  aumentar(): void {
    const disponible = this.producto().stock - this.cart.cantidadDe(this.producto().id);
    if (this.cantidad() < disponible) {
      this.cantidad.update((v) => v + 1);
    } else if (disponible <= 0) {
      this.toast.mostrar('Este producto no tiene stock disponible');
    } else {
      this.toast.mostrar(`Solo hay ${disponible} unidad${disponible === 1 ? '' : 'es'} disponible${disponible === 1 ? '' : 's'}`);
    }
  }

  agregarAlPedido(): void {
    this.cart.intentarAgregar(this.producto(), this.cantidad());
  }

  solicitarCierre(): void {
    if (this.cerrando()) {
      return;
    }
    this.cerrando.set(true);
    this.abierto.set(false);

    const origen = this.origen();
    const contenido = this.elementRef.nativeElement.querySelector('.modal-content') as HTMLElement | null;

    if (!origen || !contenido || reducedMotion()) {
      document.body.classList.remove('modal-open');
      this.cerrar.emit();
      return;
    }

    const contentRect = contenido.getBoundingClientRect();
    const cardRect = origen.getBoundingClientRect();
    const clone = contenido.cloneNode(true) as HTMLElement;
    const scaleX = cardRect.width / contentRect.width;
    const scaleY = cardRect.height / contentRect.height;
    const offsetX = cardRect.left - contentRect.left;
    const offsetY = cardRect.top - contentRect.top;

    clone.style.cssText = `position:fixed; left:${contentRect.left}px; top:${contentRect.top}px; width:${contentRect.width}px; height:${contentRect.height}px; margin:0; z-index:2002; overflow:hidden; transform-origin:0 0; transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), border-radius 0.4s cubic-bezier(0.4,0,0.2,1);`;
    document.body.appendChild(clone);
    clone.offsetHeight;
    clone.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scaleX}, ${scaleY})`;
    clone.style.borderRadius = '12px';

    let limpiado = false;
    const limpiar = () => {
      if (limpiado) {
        return;
      }
      limpiado = true;
      clone.remove();
      origen.style.opacity = '';
      document.body.classList.remove('modal-open');
      this.cerrar.emit();
    };
    clone.addEventListener('transitionend', limpiar, { once: true });
    setTimeout(limpiar, DURACION_CIERRE_MS + 150);
  }
}
