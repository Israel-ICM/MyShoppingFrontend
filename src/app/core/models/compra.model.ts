export interface Proveedor {
  id: number;
  nombre: string;
  web: string;
  email: string;
  telefono: string;
}

export type ProveedorInput = Omit<Proveedor, 'id'>;

export type EstadoCompra = 'PE' | 'RC' | 'CA';

export const ESTADOS_COMPRA: { value: EstadoCompra; label: string }[] = [
  { value: 'PE', label: 'Pendiente' },
  { value: 'RC', label: 'Recibida' },
  { value: 'CA', label: 'Cancelada' },
];

export interface DetalleCompra {
  id: number;
  producto: number;
  cantidad: number;
  costo_unitario: string;
}

export type DetalleCompraInput = Omit<DetalleCompra, 'id'>;

export interface Compra {
  id: number;
  proveedor: number;
  estado: EstadoCompra;
  creado_en: string;
  detalles: DetalleCompra[];
}

export interface CompraInput {
  proveedor: number;
  estado: EstadoCompra;
  detalles: DetalleCompraInput[];
}

/** Para agregar una línea a una compra que ya existe (endpoint plano de detalles). */
export type NuevoDetalleCompra = DetalleCompraInput & { compra: number };
