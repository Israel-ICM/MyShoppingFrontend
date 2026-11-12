import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { OrderReceiptService } from '../../../core/services/order-receipt.service';
import { Producto } from '../../../core/models/catalog.model';
import { Region } from '../../../core/models/ubicacion.model';

interface LineaPedido {
  producto: Producto;
  cantidad: number;
}

/** Checkout de la tienda pública: revisión del carrito + datos de contacto. */
@Component({
  selector: 'app-order-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './order-page.component.html',
  styleUrl: './order-page.component.scss',
})
export class OrderPageComponent {
  private readonly cart = inject(CartService);
  private readonly catalogService = inject(CatalogService);
  private readonly orderService = inject(OrderService);
  private readonly receiptService = inject(OrderReceiptService);
  private readonly fb = inject(FormBuilder);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly regiones = signal<Region[]>([]);
  protected readonly regionDropdownOpen = signal(false);

  protected readonly regionSeleccionada = computed(() => {
    const id = this.form.controls.region.value;
    return this.regiones().find((r) => r.id === id) ?? null;
  });
  protected readonly productos = signal<Producto[]>([]);
  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    observacion: [''],
    region: [null as number | null],
  });

  protected readonly lineas = computed<LineaPedido[]>(() => {
    const productos = this.productos();
    return this.cart
      .items()
      .map((linea) => {
        const producto = productos.find((p) => p.id === linea.productoId);
        return producto ? { producto, cantidad: linea.cantidad } : null;
      })
      .filter((linea): linea is LineaPedido => linea !== null);
  });

  protected readonly total = computed(() =>
    this.lineas().reduce((suma, l) => suma + Number(l.producto.precio) * l.cantidad, 0),
  );

  constructor() {
    this.catalogService.getProductos().subscribe((productos) => this.productos.set(productos));
    this.catalogService.getRegiones().subscribe((regiones) => {
      this.regiones.set(regiones);
      const laPaz = regiones.find((r) => r.nombre === 'La Paz');
      if (laPaz) {
        this.form.patchValue({ region: laPaz.id });
      }
    });
  }

  sumarCantidad(productoId: number, cantidadActual: number): void {
    this.cart.setCantidad(productoId, cantidadActual + 1);
  }

  restarCantidad(productoId: number, cantidadActual: number): void {
    this.cart.setCantidad(productoId, cantidadActual - 1);
  }

  quitar(productoId: number): void {
    this.cart.remove(productoId);
  }

  toggleRegionDropdown(): void {
    this.regionDropdownOpen.update((value) => !value);
  }

  seleccionarRegion(id: number): void {
    this.form.patchValue({ region: id });
    this.regionDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.regionDropdownOpen.set(false);
    }
  }

  cancelarPedido(): void {
    this.cart.clear();
  }

  get nombreInvalido(): boolean {
    const control = this.form.controls.nombre;
    return control.touched && control.invalid;
  }

  get telefonoInvalido(): boolean {
    const control = this.form.controls.telefono;
    return control.touched && control.invalid;
  }

  confirmar(): void {
    if (this.form.invalid || !this.lineas().length) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set(null);
    const valores = this.form.getRawValue();

    const lineas = this.lineas();

    this.orderService
      .crearPedido({
        cliente: { nombre: valores.nombre, telefono: valores.telefono, email: '' },
        region: valores.region,
        observacion: valores.observacion,
        detalles: lineas.map((l) => ({
          producto: l.producto.id,
          cantidad: l.cantidad,
          precio_unitario: l.producto.precio,
        })),
      })
      .subscribe({
        next: (pedido) => {
          this.receiptService.descargar({
            id: pedido.id,
            clienteNombre: valores.nombre,
            clienteTelefono: valores.telefono,
            lineas: lineas.map((l) => ({
              nombre: l.producto.nombre,
              cantidad: l.cantidad,
              precio: l.producto.precio,
            })),
            total: this.total(),
          });
          this.cart.clear();
          this.enviando.set(false);
          this.enviado.set(true);
        },
        error: () => {
          this.enviando.set(false);
          this.error.set('No se pudo enviar el pedido. Intenta de nuevo.');
        },
      });
  }
}
