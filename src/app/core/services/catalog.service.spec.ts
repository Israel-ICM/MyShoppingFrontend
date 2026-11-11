import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CatalogService } from './catalog.service';
import { environment } from '../../../environments/environment';
import { Categoria, Marca, Producto, ProductoInput } from '../models/catalog.model';
import { Pais } from '../models/ubicacion.model';

describe('CatalogService', () => {
  let service: CatalogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CatalogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lists products from GET /catalogo/productos/', () => {
    const productos: Producto[] = [];
    let result: Producto[] | undefined;

    service.getProductos().subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/catalogo/productos/`);
    expect(req.request.method).toBe('GET');
    req.flush(productos);

    expect(result).toBe(productos);
  });

  it('lists products filtered by category and brand as query params', () => {
    service.getProductos({ categoria: 1, marca: 10 }).subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.url === `${environment.apiUrl}/catalogo/productos/` &&
        request.params.get('categorias') === '1' &&
        request.params.get('marca') === '10',
    );
    req.flush([]);
  });

  it('gets a single product from GET /catalogo/productos/:id/', () => {
    const producto = { id: 7 } as Producto;
    let result: Producto | undefined;

    service.getProducto(7).subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/catalogo/productos/7/`);
    expect(req.request.method).toBe('GET');
    req.flush(producto);

    expect(result).toBe(producto);
  });

  it('lists categories from GET /catalogo/categorias/', () => {
    const categorias: Categoria[] = [];
    let result: Categoria[] | undefined;

    service.getCategorias().subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/catalogo/categorias/`);
    expect(req.request.method).toBe('GET');
    req.flush(categorias);

    expect(result).toBe(categorias);
  });

  it('lists brands from GET /catalogo/marcas/', () => {
    const marcas: Marca[] = [];
    let result: Marca[] | undefined;

    service.getMarcas().subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/catalogo/marcas/`);
    expect(req.request.method).toBe('GET');
    req.flush(marcas);

    expect(result).toBe(marcas);
  });

  it('lists countries from GET /ubicaciones/paises/', () => {
    const paises: Pais[] = [];
    let result: Pais[] | undefined;

    service.getPaises().subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/ubicaciones/paises/`);
    expect(req.request.method).toBe('GET');
    req.flush(paises);

    expect(result).toBe(paises);
  });

  it('creates a product with POST /catalogo/productos/', () => {
    const input = { nombre: 'Sérum A' } as ProductoInput;
    const creado = { id: 9 } as Producto;
    let result: Producto | undefined;

    service.createProducto(input).subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/catalogo/productos/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(input);
    req.flush(creado);

    expect(result).toBe(creado);
  });

  it('updates a product with PUT /catalogo/productos/:id/', () => {
    const input = { nombre: 'Sérum A editado' } as ProductoInput;
    const actualizado = { id: 9 } as Producto;
    let result: Producto | undefined;

    service.updateProducto(9, input).subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/catalogo/productos/9/`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBe(input);
    req.flush(actualizado);

    expect(result).toBe(actualizado);
  });

  it('deletes a product with DELETE /catalogo/productos/:id/', () => {
    let completed = false;

    service.deleteProducto(9).subscribe({ complete: () => (completed = true) });

    const req = httpMock.expectOne(`${environment.apiUrl}/catalogo/productos/9/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(completed).toBe(true);
  });
});
