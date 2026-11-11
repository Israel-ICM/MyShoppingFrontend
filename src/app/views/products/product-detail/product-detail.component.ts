import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { Categoria, Marca, Producto } from '../../../core/models/catalog.model';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogService = inject(CatalogService);

  private readonly productId = Number(this.route.snapshot.paramMap.get('id'));

  readonly producto = signal<Producto | null>(null);
  readonly categorias = signal<Categoria[]>([]);
  readonly marcas = signal<Marca[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly deleting = signal(false);

  constructor() {
    this.catalogService.getCategorias().subscribe((categorias) => this.categorias.set(categorias));
    this.catalogService.getMarcas().subscribe((marcas) => this.marcas.set(marcas));
    this.catalogService.getProducto(this.productId).subscribe({
      next: (producto) => {
        this.producto.set(producto);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el producto.');
        this.loading.set(false);
      },
    });
  }

  marcaNombre(marcaId: number): string {
    return this.marcas().find((marca) => marca.id === marcaId)?.nombre ?? '—';
  }

  nombresCategorias(categoriaIds: number[]): string {
    const nombres = this.categorias()
      .filter((categoria) => categoriaIds.includes(categoria.id))
      .map((categoria) => categoria.nombre);
    return nombres.length > 0 ? nombres.join(', ') : '—';
  }

  eliminar(): void {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }

    this.deleting.set(true);
    this.actionError.set(null);
    this.catalogService.deleteProducto(this.productId).subscribe({
      next: () => this.router.navigate(['/productos']),
      error: () => {
        this.actionError.set('No se pudo eliminar el producto.');
        this.deleting.set(false);
      },
    });
  }
}
