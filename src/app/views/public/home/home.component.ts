import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CatalogService } from '../../../core/services/catalog.service';
import { StoreFilterService } from '../../../core/services/store-filter.service';
import { Categoria, Producto } from '../../../core/models/catalog.model';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductModalComponent } from '../product-modal/product-modal.component';

const TREINTA_DIAS_MS = 30 * 24 * 60 * 60 * 1000;
const AUTOPLAY_MS = 5000;
const BANNERS = ['img/banner1.jpg', 'img/banner2.jpg'];

/** Web principal de la tienda: hero, categorías y catálogo de productos. */
@Component({
  selector: 'app-home',
  imports: [ProductCardComponent, ProductModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly catalogService = inject(CatalogService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly storeFilter = inject(StoreFilterService);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly cargando = signal(true);

  protected readonly banners = signal(BANNERS);
  protected readonly slideActual = signal(0);
  private autoPlay?: ReturnType<typeof setInterval>;

  protected readonly productoModal = signal<Producto | null>(null);
  protected origenModal: HTMLElement | null = null;

  protected readonly productosFiltrados = computed(() => {
    const filtro = this.storeFilter.filtro();
    const productos = this.productos();

    if (!filtro) {
      return productos;
    }
    if (filtro.tipo === 'categoria') {
      return productos.filter((p) => p.categorias.includes(filtro.id!));
    }
    if (filtro.tipo === 'marca') {
      return productos.filter((p) => p.marca === filtro.id);
    }
    return productos.filter((p) => Date.now() - new Date(p.creado_en).getTime() < TREINTA_DIAS_MS);
  });

  protected readonly filtroTexto = computed(() => {
    const filtro = this.storeFilter.filtro();
    if (!filtro) {
      return '';
    }
    if (filtro.tipo === 'novedades') {
      return `Novedades — últimos ${filtro.etiqueta}`;
    }
    return `Productos de ${filtro.etiqueta}`;
  });

  constructor() {
    this.catalogService.getCategorias().subscribe((categorias) => this.categorias.set(categorias));
    this.catalogService.getProductos().subscribe({
      next: (productos) => {
        this.productos.set(productos.filter((p) => p.activo));
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });

    this.iniciarAutoPlay();
    this.destroyRef.onDestroy(() => this.detenerAutoPlay());
  }

  irASlide(index: number): void {
    const total = this.banners().length;
    this.slideActual.set((index + total) % total);
  }

  slideSiguiente(): void {
    this.irASlide(this.slideActual() + 1);
    this.iniciarAutoPlay();
  }

  slideAnterior(): void {
    this.irASlide(this.slideActual() - 1);
    this.iniciarAutoPlay();
  }

  irADot(index: number): void {
    this.irASlide(index);
    this.iniciarAutoPlay();
  }

  private iniciarAutoPlay(): void {
    this.detenerAutoPlay();
    if (this.banners().length > 1) {
      this.autoPlay = setInterval(() => this.irASlide(this.slideActual() + 1), AUTOPLAY_MS);
    }
  }

  private detenerAutoPlay(): void {
    clearInterval(this.autoPlay);
  }

  seleccionarCategoria(categoria: Categoria | null): void {
    if (categoria === null) {
      this.storeFilter.limpiar();
      return;
    }
    this.storeFilter.setCategoria(categoria.id, categoria.nombre);
  }

  categoriaActiva(categoria: Categoria): boolean {
    const filtro = this.storeFilter.filtro();
    return filtro?.tipo === 'categoria' && filtro.id === categoria.id;
  }

  abrirDetalle(producto: Producto): void {
    this.origenModal = document.querySelector(`.product-card[data-id="${producto.id}"]`);
    this.productoModal.set(producto);
  }

  cerrarDetalle(): void {
    this.productoModal.set(null);
    this.origenModal = null;
  }

  categoriaNombreDe(producto: Producto): string {
    return producto.categorias
      .map((id) => this.categorias().find((c) => c.id === id)?.nombre)
      .filter((nombre): nombre is string => !!nombre)
      .join(', ');
  }
}
