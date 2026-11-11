import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductFormComponent } from './product-form.component';
import { CatalogService } from '../../../core/services/catalog.service';
import { Categoria, Marca, Producto } from '../../../core/models/catalog.model';
import { Pais } from '../../../core/models/ubicacion.model';

describe('ProductFormComponent', () => {
  let fixture: ComponentFixture<ProductFormComponent>;
  let component: ProductFormComponent;
  let router: Router;

  const categorias: Categoria[] = [{ id: 1, nombre: 'Skincare' }];
  const marcas: Marca[] = [{ id: 10, nombre: 'Innisfree' }];
  const paises: Pais[] = [{ id: 1, nombre: 'Corea del Sur' }];

  function setup(
    routeId: string | null,
    catalogServiceMock: Partial<CatalogService>,
  ): void {
    TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        provideRouter([]),
        { provide: CatalogService, useValue: catalogServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(routeId ? { id: routeId } : {}) } },
        },
      ],
    });
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    fixture.detectChanges();
  }

  it('starts in create mode without fetching a product', () => {
    const getProducto = vi.fn();
    setup(null, {
      getCategorias: () => of(categorias),
      getMarcas: () => of(marcas),
      getPaises: () => of(paises),
      getProducto,
    });

    expect(component.isEdit).toBe(false);
    expect(component.loading()).toBe(false);
    expect(getProducto).not.toHaveBeenCalled();
  });

  it('loads the product and prefills the form in edit mode', () => {
    const producto: Producto = {
      id: 7,
      categorias: [1],
      codigo: 'A',
      nombre: 'Sérum A',
      descripcion: 'desc',
      pais: 1,
      marca: 10,
      peso: '1',
      costo: '1',
      precio: '50',
      stock: 3,
      link_referencia: '',
      creado_en: '',
      activo: true,
    };

    setup('7', {
      getCategorias: () => of(categorias),
      getMarcas: () => of(marcas),
      getPaises: () => of(paises),
      getProducto: () => of(producto),
    });

    expect(component.isEdit).toBe(true);
    expect(component.loading()).toBe(false);
    expect(component.form.controls.nombre.value).toBe('Sérum A');
    expect(component.selectedCategorias()).toEqual([1]);
  });

  it('toggles a category id in and out of the selection', () => {
    setup(null, {
      getCategorias: () => of(categorias),
      getMarcas: () => of(marcas),
      getPaises: () => of(paises),
    });

    component.toggleCategoria(1);
    expect(component.selectedCategorias()).toEqual([1]);

    component.toggleCategoria(1);
    expect(component.selectedCategorias()).toEqual([]);
  });

  it('excludes selected categories from the available pool and filters by search text', () => {
    setup(null, {
      getCategorias: () => of([...categorias, { id: 2, nombre: 'Maquillaje' }]),
      getMarcas: () => of(marcas),
      getPaises: () => of(paises),
    });

    component.toggleCategoria(1);
    expect(component.categoriasDisponibles()).toEqual([{ id: 2, nombre: 'Maquillaje' }]);

    component.onCategoriaSearch('maqui');
    expect(component.categoriasDisponibles()).toEqual([{ id: 2, nombre: 'Maquillaje' }]);

    component.onCategoriaSearch('nada');
    expect(component.categoriasDisponibles()).toEqual([]);
  });

  it('creates a product and navigates to its detail page on submit', () => {
    const createProducto = vi.fn(() => of({ id: 9 } as Producto));
    setup(null, {
      getCategorias: () => of(categorias),
      getMarcas: () => of(marcas),
      getPaises: () => of(paises),
      createProducto,
    });

    component.form.setValue({
      codigo: 'A',
      nombre: 'Sérum A',
      descripcion: '',
      pais: 1,
      marca: 10,
      peso: '1',
      costo: '1',
      precio: '50',
      stock: 3,
      link_referencia: '',
      activo: true,
    });

    component.onSubmit();

    expect(createProducto).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/productos', 9]);
  });

  it('shows an error and does not navigate when saving fails', () => {
    setup(null, {
      getCategorias: () => of(categorias),
      getMarcas: () => of(marcas),
      getPaises: () => of(paises),
      createProducto: () => throwError(() => new Error('boom')),
    });

    component.form.setValue({
      codigo: 'A',
      nombre: 'Sérum A',
      descripcion: '',
      pais: 1,
      marca: 10,
      peso: '1',
      costo: '1',
      precio: '50',
      stock: 3,
      link_referencia: '',
      activo: true,
    });

    component.onSubmit();

    expect(component.error()).toBe('No se pudo guardar el producto.');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('does not submit when the form is invalid', () => {
    const createProducto = vi.fn();
    setup(null, {
      getCategorias: () => of(categorias),
      getMarcas: () => of(marcas),
      getPaises: () => of(paises),
      createProducto,
    });

    component.onSubmit();

    expect(createProducto).not.toHaveBeenCalled();
  });
});
