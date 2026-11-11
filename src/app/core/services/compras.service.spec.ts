import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComprasService } from './compras.service';
import { environment } from '../../../environments/environment';
import { Compra, CompraInput, NuevoDetalleCompra, Proveedor, ProveedorInput } from '../models/compra.model';

describe('ComprasService', () => {
  let service: ComprasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ComprasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lists suppliers from GET /compras/proveedores/', () => {
    const proveedores: Proveedor[] = [];
    let result: Proveedor[] | undefined;

    service.getProveedores().subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/compras/proveedores/`);
    expect(req.request.method).toBe('GET');
    req.flush(proveedores);

    expect(result).toBe(proveedores);
  });

  it('creates a supplier with POST /compras/proveedores/', () => {
    const input = { nombre: 'Proveedor A' } as ProveedorInput;
    const creado = { id: 1 } as Proveedor;
    let result: Proveedor | undefined;

    service.createProveedor(input).subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/compras/proveedores/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(input);
    req.flush(creado);

    expect(result).toBe(creado);
  });

  it('updates a supplier with PUT /compras/proveedores/:id/', () => {
    service.updateProveedor(1, { nombre: 'Editado' } as ProveedorInput).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/compras/proveedores/1/`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('deletes a supplier with DELETE /compras/proveedores/:id/', () => {
    service.deleteProveedor(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/compras/proveedores/1/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('lists purchase orders (with nested detalles) from GET /compras/compras/', () => {
    const compras: Compra[] = [];
    let result: Compra[] | undefined;

    service.getCompras().subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/compras/compras/`);
    expect(req.request.method).toBe('GET');
    req.flush(compras);

    expect(result).toBe(compras);
  });

  it('gets a single purchase order (with nested detalles) from GET /compras/compras/:id/', () => {
    service.getCompra(5).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/compras/compras/5/`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('creates a purchase order with its line items in a single atomic POST', () => {
    const input: CompraInput = {
      proveedor: 1,
      estado: 'PE',
      detalles: [{ producto: 1, cantidad: 2, costo_unitario: '10.00' }],
    };
    const creado = { id: 5 } as Compra;
    let result: Compra | undefined;

    service.createCompra(input).subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/compras/compras/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(input);
    req.flush(creado);

    expect(result).toBe(creado);
  });

  it('updates only the state with PATCH /compras/compras/:id/', () => {
    service.updateCompraEstado(5, 'RC').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/compras/compras/5/`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ estado: 'RC' });
    req.flush({});
  });

  it('deletes a purchase order with DELETE /compras/compras/:id/', () => {
    service.deleteCompra(5).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/compras/compras/5/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('adds a line item to an existing purchase order with POST /compras/detalles-compra/', () => {
    const input: NuevoDetalleCompra = { compra: 5, producto: 1, cantidad: 2, costo_unitario: '10' };
    service.createDetalle(input).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/compras/detalles-compra/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(input);
    req.flush({});
  });

  it('deletes a line item with DELETE /compras/detalles-compra/:id/', () => {
    service.deleteDetalle(9).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/compras/detalles-compra/9/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
