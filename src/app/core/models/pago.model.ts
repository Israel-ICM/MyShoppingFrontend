export type MetodoPago = 'TC' | 'TR' | 'EF';

export const METODOS_PAGO: { value: MetodoPago; label: string }[] = [
  { value: 'EF', label: 'Efectivo' },
  { value: 'TR', label: 'Transferencia' },
  { value: 'TC', label: 'Tarjeta' },
];

export type EstadoPago = 'PE' | 'CO' | 'FA' | 'RE';

export const ESTADOS_PAGO: { value: EstadoPago; label: string }[] = [
  { value: 'PE', label: 'Pendiente' },
  { value: 'CO', label: 'Completado' },
  { value: 'FA', label: 'Fallido' },
  { value: 'RE', label: 'Reembolsado' },
];

export interface Pago {
  id: number;
  pedido: number;
  monto: string;
  metodo: MetodoPago;
  estado: EstadoPago;
  referencia_externa: string;
  creado_en: string;
}

export type PagoInput = Omit<Pago, 'id' | 'creado_en'>;
