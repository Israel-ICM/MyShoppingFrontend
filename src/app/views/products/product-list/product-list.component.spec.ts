import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductListComponent } from './product-list.component';
import { CatalogService } from '../../../core/services/catalog.service';
import { Categoria, Marca, Producto } from '../../../core/models/catalog.model';

describe('ProductListComponent', () => {
  let fixture: ComponentFixture<ProductListComponent>;
  let component: ProductListComponent;
  let getProductos: ReturnType<typeof vi.fn>;

  const categorias: Categoria[] = [{ id: 1, nombre: 'Skincare' }];
  const marcas: Marca[] = [
    { id: 10, nombre: 'Innisfree' },
    { id: 20, nombre: 'Laneige' },
  ];
  const productos: Producto[] = [
    { id: 1, categorias: [1], codigo: 'A', nombre: 'Sérum A', descripcion: '', pais: 1, marca: 10, peso: '1', costo: '1', precio: '50', stock: 3, link_referencia: '', creado_en: '', activo: true },
  ];

  function setup(getProductosImpl?: () => ReturnType<CatalogService['getProductos']>): void {
    getProductos = vi.fn(getProductosImpl ?? (() => of(productos)));

    TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        provideRouter([]),
        {
          provide: CatalogService,
          useValue: {
            getProductos,
            getCategorias: () => of(categorias),
            getMarcas: () => of(marcas),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads products, categories and brands on init', () => {
    setup();

    expect(component.loading()).toBe(false);
    expect(component.productos()).toEqual(productos);
    expect(component.categorias()).toEqual(categorias);
    expect(component.marcas()).toEqual(marcas);
    expect(getProductos).toHaveBeenCalledWith({ categoria: null, marca: null });
  });

  it('shows an error state when the product request fails', () => {
    setup(() => throwError(() => new Error('boom')));

    expect(component.loading()).toBe(false);
    expect(component.error()).toBe('No se pudieron cargar los productos.');
  });

  it('re-fetches with the selected brand as a filter', () => {
    setup();

    component.onMarcaChange(20);

    expect(getProductos).toHaveBeenLastCalledWith({ categoria: null, marca: 20 });
  });

  it('re-fetches with the selected category as a filter', () => {
    setup();

    component.onCategoriaChange(1);

    expect(getProductos).toHaveBeenLastCalledWith({ categoria: 1, marca: null });
  });

  it('resolves the brand name for a product', () => {
    setup();

    expect(component.marcaNombre(10)).toBe('Innisfree');
  });
});
