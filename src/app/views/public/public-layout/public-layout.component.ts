import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ThemeService } from '../../../core/services/theme.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { StoreFilterService } from '../../../core/services/store-filter.service';
import { Categoria, Marca, Producto } from '../../../core/models/catalog.model';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { CONTACT_ITEMS, FAQS, SHIPPING_ROWS } from './public-layout.content';

const SPLASH_DURATION_MS = 1200;
const NOVEDADES_DIAS = 30;
const HEADER_SCROLL_THRESHOLD = 40;

/** Shell de la tienda pública: header, overlays (buscador/marcas/categorías/FAQ/contactos/envíos), contenido y footer. */
@Component({
  selector: 'app-public-layout',
  imports: [RouterLink, RouterOutlet, LogoComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss',
})
export class PublicLayoutComponent {
  private readonly catalogService = inject(CatalogService);
  private readonly router = inject(Router);

  protected readonly cart = inject(CartService);
  protected readonly themeService = inject(ThemeService);
  protected readonly storeFilter = inject(StoreFilterService);

  protected readonly splashVisible = signal(true);
  protected readonly scrolled = signal(false);
  protected readonly mobileMenuOpen = signal(false);
  protected readonly cartDropdownOpen = signal(false);

  protected readonly spotlightOpen = signal(false);
  protected readonly spotlightQuery = signal('');
  private readonly spotlightProductos = signal<Producto[] | null>(null);

  protected readonly spotlightResultados = computed(() => {
    const termino = this.spotlightQuery().trim().toLowerCase();
    const productos = this.spotlightProductos() ?? [];
    if (!termino) {
      return [];
    }
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(termino) ||
        p.marca_nombre?.toLowerCase().includes(termino),
    );
  });

  protected readonly brandsOverlayOpen = signal(false);
  protected readonly brandsQuery = signal('');
  private readonly marcas = signal<Marca[] | null>(null);

  protected readonly marcasFiltradas = computed(() => {
    const termino = this.brandsQuery().trim().toLowerCase();
    const marcas = this.marcas() ?? [];
    return termino ? marcas.filter((m) => m.nombre.toLowerCase().includes(termino)) : marcas;
  });

  protected readonly categoriesOverlayOpen = signal(false);
  protected readonly categoriesQuery = signal('');
  private readonly categoriasNav = signal<Categoria[] | null>(null);

  protected readonly categoriasFiltradas = computed(() => {
    const termino = this.categoriesQuery().trim().toLowerCase();
    const categorias = this.categoriasNav() ?? [];
    return termino ? categorias.filter((c) => c.nombre.toLowerCase().includes(termino)) : categorias;
  });

  protected readonly faqOpen = signal(false);
  protected readonly contactsOpen = signal(false);
  protected readonly shippingOpen = signal(false);

  protected readonly faqs = FAQS;
  protected readonly contactItems = CONTACT_ITEMS;
  protected readonly shippingRows = SHIPPING_ROWS;

  constructor() {
    setTimeout(() => this.splashVisible.set(false), SPLASH_DURATION_MS);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > HEADER_SCROLL_THRESHOLD);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleCartDropdown(): void {
    this.cartDropdownOpen.update((value) => !value);
  }

  cancelarPedido(): void {
    this.cart.clear();
    this.cartDropdownOpen.set(false);
  }

  openSpotlight(): void {
    this.spotlightOpen.set(true);
    if (this.spotlightProductos() === null) {
      this.catalogService.getProductos().subscribe((productos) => {
        this.spotlightProductos.set(productos.filter((p) => p.activo));
      });
    }
  }

  closeSpotlight(): void {
    this.spotlightOpen.set(false);
    this.spotlightQuery.set('');
  }

  onSpotlightQueryChange(event: Event): void {
    this.spotlightQuery.set((event.target as HTMLInputElement).value);
  }

  openBrandsOverlay(): void {
    this.brandsOverlayOpen.set(true);
    if (this.marcas() === null) {
      this.catalogService.getMarcas().subscribe((marcas) => this.marcas.set(marcas));
    }
  }

  closeBrandsOverlay(): void {
    this.brandsOverlayOpen.set(false);
    this.brandsQuery.set('');
  }

  onBrandsQueryChange(event: Event): void {
    this.brandsQuery.set((event.target as HTMLInputElement).value);
  }

  seleccionarMarca(marca: Marca): void {
    this.storeFilter.setMarca(marca.id, marca.nombre);
    this.closeBrandsOverlay();
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }

  openCategoriesOverlay(): void {
    this.categoriesOverlayOpen.set(true);
    if (this.categoriasNav() === null) {
      this.catalogService.getCategorias().subscribe((categorias) => this.categoriasNav.set(categorias));
    }
  }

  closeCategoriesOverlay(): void {
    this.categoriesOverlayOpen.set(false);
    this.categoriesQuery.set('');
  }

  onCategoriesQueryChange(event: Event): void {
    this.categoriesQuery.set((event.target as HTMLInputElement).value);
  }

  seleccionarCategoriaNav(categoria: Categoria): void {
    this.storeFilter.setCategoria(categoria.id, categoria.nombre);
    this.closeCategoriesOverlay();
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }

  aplicarNovedades(): void {
    this.storeFilter.setNovedades(NOVEDADES_DIAS);
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }

  openFaq(): void {
    this.faqOpen.set(true);
  }

  closeFaq(): void {
    this.faqOpen.set(false);
  }

  openContacts(): void {
    this.contactsOpen.set(true);
  }

  closeContacts(): void {
    this.contactsOpen.set(false);
  }

  openShipping(): void {
    this.shippingOpen.set(true);
  }

  closeShipping(): void {
    this.shippingOpen.set(false);
  }
}
