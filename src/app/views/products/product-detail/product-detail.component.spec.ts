import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductDetailComponent } from './product-detail.component';
import { CatalogService } from '../../../core/services/catalog.service';
import { Categoria, Marca, Producto } from '../../../core/models/catalog.model';

describe('ProductDetailComponent', () => {
  let fixture: ComponentFixture<ProductDetailComponent>;
  let component: ProductDetailComponent;
  let router: Router;

  const categorias: Categoria[] = [{ id: 1, nombre: 'Skincare' }];
  const marcas: Marca[] = [{ id: 10, nombre: 'Innisfree' }];
  const producto: Producto = {
    id: 7,
    categorias: [1],
    codigo: 'A',
    nombre: 'Sérum A',
    descripcion: 'Descripción',
    pais: 1,
    marca: 10,
    marca_nombre: 'Innisfree',
    fotos: [],
    videos: [],
    peso: '1',
    costo: '1',
    precio: '50',
    stock: 3,
    link_referencia: '',
    creado_en: '',
    activo: true,
  };

  function setup(catalogServiceMock: Partial<CatalogService>): void {
    TestBed.configureTestingModule({
      imports: [ProductDetailComponent],
      providers: [
        provideRouter([]),
        { provide: CatalogService, useValue: catalogServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } },
        },
      ],
    });
    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    fixture.detectChanges();
  }

  it('loads the product for the id in the route and resolves brand/category names', () => {
    setup({
      getProducto: () => of(producto),
      getCategorias: () => of(categorias),
      getMarcas: () => of(marcas),
    });

    expect(component.loading()).toBe(false);
    expect(component.producto()).toEqual(producto);
    expect(component.marcaNombre(10)).toBe('Innisfree');
    expect(component.nombresCategorias([1])).toBe('Skincare');
  });

  it('shows an error state when the product request fails', () => {
    setup({
      getProducto: () => throwError(() => new Error('boom')),
      getCategorias: () => of(categorias),
      getMarcas: () => of(marcas),
    });

    expect(component.loading()).toBe(false);
    expect(component.error()).toBe('No se pudo cargar el producto.');
  });

  it('does nothing when the user cancels the confirm dialog', () => {
    const deleteProducto = vi.fn();
    setup({
      getProducto: () => of(producto),
      getCategorias: () => of(categorias),
      getMarcas: () => of(marcas),
      deleteProducto,
    });
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.eliminar();

    expect(deleteProducto).not.toHaveBeenCalled();
  });

  it('deletes the product and navigates to the list when confirmed', () => {
    setup({
      getProducto: () => of(producto),
      getCategorias: () => of(categorias),
      getMarcas: () => of(marcas),
      deleteProducto: () => of(undefined),
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.eliminar();

    expect(router.navigate).toHaveBeenCalledWith(['/admin/productos']);
  });

  it('shows an action error and stops the deleting state when delete fails', () => {
    setup({
      getProducto: () => of(producto),
      getCategorias: () => of(categorias),
      getMarcas: () => of(marcas),
      deleteProducto: () => throwError(() => new Error('boom')),
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.eliminar();

    expect(component.actionError()).toBe('No se pudo eliminar el producto.');
    expect(component.deleting()).toBe(false);
  });
});
