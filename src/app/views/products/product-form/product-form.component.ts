import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { Categoria, Marca, ProductoFoto, ProductoInput, ProductoVideo } from '../../../core/models/catalog.model';
import { Pais } from '../../../core/models/ubicacion.model';
import { FilterSelectComponent } from '../../../shared/components/filter-select/filter-select.component';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, RouterLink, FilterSelectComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogService = inject(CatalogService);

  private readonly productoId = this.route.snapshot.paramMap.get('id');
  readonly isEdit = this.productoId !== null;

  readonly categorias = signal<Categoria[]>([]);
  readonly marcas = signal<Marca[]>([]);
  readonly paises = signal<Pais[]>([]);
  readonly selectedCategorias = signal<number[]>([]);
  readonly categoriaSearch = signal('');

  readonly categoriasDisponibles = computed(() => {
    const texto = this.categoriaSearch().trim().toLowerCase();
    return this.categorias().filter(
      (categoria) =>
        !this.selectedCategorias().includes(categoria.id) &&
        (texto === '' || categoria.nombre.toLowerCase().includes(texto)),
    );
  });

  readonly loading = signal(this.isEdit);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly fotos = signal<Array<Partial<ProductoFoto> & { url: string; principal: boolean }>>([]);
  readonly videos = signal<Array<Partial<ProductoVideo> & { url: string }>>([]);
  readonly fotoUrlInput = signal('');
  readonly videoUrlInput = signal('');
  readonly subiendoArchivo = signal(false);
  readonly errorArchivo = signal<string | null>(null);

  readonly form = new FormGroup({
    codigo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true }),
    pais: new FormControl<number | null>(null, { validators: [Validators.required] }),
    marca: new FormControl<number | null>(null, { validators: [Validators.required] }),
    peso: new FormControl('0', { nonNullable: true, validators: [Validators.required] }),
    costo: new FormControl('0', { nonNullable: true, validators: [Validators.required] }),
    precio: new FormControl('0', { nonNullable: true, validators: [Validators.required] }),
    stock: new FormControl(0, { nonNullable: true, validators: [Validators.required] }),
    link_referencia: new FormControl('', { nonNullable: true }),
    activo: new FormControl(true, { nonNullable: true }),
  });

  constructor() {
    this.catalogService.getCategorias().subscribe((categorias) => this.categorias.set(categorias));
    this.catalogService.getMarcas().subscribe((marcas) => this.marcas.set(marcas));
    this.catalogService.getPaises().subscribe((paises) => this.paises.set(paises));

    if (this.productoId) {
      this.catalogService.getProducto(Number(this.productoId)).subscribe({
        next: (producto) => {
          this.form.patchValue(producto);
          this.selectedCategorias.set(producto.categorias);
          this.fotos.set(producto.fotos);
          this.videos.set(producto.videos);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el producto.');
          this.loading.set(false);
        },
      });
    }
  }

  toggleCategoria(id: number): void {
    this.selectedCategorias.update((ids) =>
      ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id],
    );
  }

  categoriaNombre(id: number): string {
    return this.categorias().find((categoria) => categoria.id === id)?.nombre ?? '—';
  }

  onCategoriaSearch(value: string): void {
    this.categoriaSearch.set(value);
  }

  onFotoUrlInput(value: string): void {
    this.fotoUrlInput.set(value);
  }

  agregarFotoUrl(): void {
    const url = this.fotoUrlInput().trim();
    if (!url) {
      return;
    }
    this.fotos.update((actual) => [...actual, { url, principal: actual.length === 0 }]);
    this.fotoUrlInput.set('');
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivos = input.files;
    if (!archivos || archivos.length === 0) {
      return;
    }

    this.subiendoArchivo.set(true);
    this.errorArchivo.set(null);

    Array.from(archivos).forEach((archivo) => {
      this.catalogService.subirImagen(archivo).subscribe({
        next: ({ url }) => {
          this.fotos.update((actual) => [...actual, { url, principal: actual.length === 0 }]);
          this.subiendoArchivo.set(false);
        },
        error: () => {
          this.subiendoArchivo.set(false);
          this.errorArchivo.set('No se pudo subir la imagen.');
        },
      });
    });
    input.value = '';
  }

  marcarPrincipal(index: number): void {
    this.fotos.update((actual) => actual.map((foto, i) => ({ ...foto, principal: i === index })));
  }

  quitarFoto(index: number): void {
    this.fotos.update((actual) => {
      const siguiente = actual.filter((_, i) => i !== index);
      if (siguiente.length > 0 && !siguiente.some((f) => f.principal)) {
        siguiente[0] = { ...siguiente[0], principal: true };
      }
      return siguiente;
    });
  }

  onVideoUrlInput(value: string): void {
    this.videoUrlInput.set(value);
  }

  agregarVideo(): void {
    const url = this.videoUrlInput().trim();
    if (!url) {
      return;
    }
    this.videos.update((actual) => [...actual, { url }]);
    this.videoUrlInput.set('');
  }

  quitarVideo(index: number): void {
    this.videos.update((actual) => actual.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const value = this.form.getRawValue();
    const producto: ProductoInput = {
      ...value,
      pais: value.pais as number,
      marca: value.marca as number,
      categorias: this.selectedCategorias(),
      fotos: this.fotos().map(({ url, principal }) => ({ url, principal })),
      videos: this.videos().map(({ url }) => ({ url })),
    };

    const request$ = this.isEdit
      ? this.catalogService.updateProducto(Number(this.productoId), producto)
      : this.catalogService.createProducto(producto);

    request$.subscribe({
      next: (producto) => {
        this.saving.set(false);
        this.router.navigate(['/admin/productos', producto.id]);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('No se pudo guardar el producto.');
      },
    });
  }
}
