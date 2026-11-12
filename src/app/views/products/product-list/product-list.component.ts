import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { Categoria, Marca, Producto } from '../../../core/models/catalog.model';
import { FilterSelectComponent } from '../../../shared/components/filter-select/filter-select.component';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink, FilterSelectComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent {
  private readonly catalogService = inject(CatalogService);

  readonly productos = signal<Producto[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly marcas = signal<Marca[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly categoriaId = signal<number | null>(null);
  readonly marcaId = signal<number | null>(null);

  constructor() {
    this.catalogService.getCategorias().subscribe((categorias) => this.categorias.set(categorias));
    this.catalogService.getMarcas().subscribe((marcas) => this.marcas.set(marcas));
    this.cargarProductos();
  }

  marcaNombre(marcaId: number): string {
    return this.marcas().find((marca) => marca.id === marcaId)?.nombre ?? '—';
  }

  fotoPrincipal(producto: Producto): string | null {
    const fotos = producto.fotos;
    return fotos.find((foto) => foto.principal)?.url ?? fotos[0]?.url ?? null;
  }

  onCategoriaChange(value: string | number | null): void {
    this.categoriaId.set(value === null ? null : Number(value));
    this.cargarProductos();
  }

  onMarcaChange(value: string | number | null): void {
    this.marcaId.set(value === null ? null : Number(value));
    this.cargarProductos();
  }

  private cargarProductos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.catalogService
      .getProductos({ categoria: this.categoriaId(), marca: this.marcaId() })
      .subscribe({
        next: (productos) => {
          this.productos.set(productos);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los productos.');
          this.loading.set(false);
        },
      });
  }
}
