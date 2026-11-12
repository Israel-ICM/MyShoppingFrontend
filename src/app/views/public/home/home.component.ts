import { Component, computed, inject, signal } from '@angular/core';
import { CatalogService } from '../../../core/services/catalog.service';
import { CartService } from '../../../core/services/cart.service';
import { StoreFilterService } from '../../../core/services/store-filter.service';
import { Categoria, Producto } from '../../../core/models/catalog.model';
import { ProductCardComponent } from '../product-card/product-card.component';

const TREINTA_DIAS_MS = 30 * 24 * 60 * 60 * 1000;

/** Web principal de la tienda: hero, categorías y catálogo de productos. */
@Component({
  selector: 'app-home',
  imports: [ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly catalogService = inject(CatalogService);
  protected readonly cart = inject(CartService);
  protected readonly storeFilter = inject(StoreFilterService);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly cargando = signal(true);

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

  agregarAlCarrito(producto: Producto): void {
    this.cart.add(producto.id);
  }
}
