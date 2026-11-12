export type TipoMovimiento = 'VT' | 'CM' | 'AJ' | 'DV' | 'MR';

export const TIPOS_MOVIMIENTO: { value: TipoMovimiento; label: string }[] = [
  { value: 'VT', label: 'Venta' },
  { value: 'CM', label: 'Compra' },
  { value: 'AJ', label: 'Ajuste' },
  { value: 'DV', label: 'Devolución' },
  { value: 'MR', label: 'Merma' },
];

export interface MovimientoStock {
  id: number;
  producto: number;
  producto_nombre: string;
  tipo: TipoMovimiento;
  cantidad: number;
  stock_resultante: number;
  lote: number | null;
  observacion: string;
  creado_en: string;
}

export interface AjusteStockInput {
  producto: number;
  tipo: 'AJ' | 'DV' | 'MR';
  cantidad: number;
  observacion?: string;
}

export interface LoteInventario {
  id: number;
  detalle_compra: number;
  producto: number;
  producto_nombre: string;
  fecha_vencimiento: string;
  cantidad_actual: number;
  creado_en: string;
}

export interface RecibirCompraInput {
  lotes: { detalle: number; fecha_vencimiento: string }[];
}
