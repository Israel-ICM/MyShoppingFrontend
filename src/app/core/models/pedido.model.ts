export type EstadoPedido = 'PE' | 'CO' | 'EN' | 'EG' | 'CA';

export const ESTADOS_PEDIDO: { value: EstadoPedido; label: string }[] = [
  { value: 'PE', label: 'Pendiente' },
  { value: 'CO', label: 'Confirmado' },
  { value: 'EN', label: 'Enviado' },
  { value: 'EG', label: 'Entregado' },
  { value: 'CA', label: 'Cancelado' },
];

export interface ClientePedido {
  nombre: string;
  telefono: string;
  email: string;
}

export interface DetallePedido {
  id: number;
  producto: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: string;
}

export interface Pedido {
  id: number;
  cliente: ClientePedido;
  region: number | null;
  region_nombre: string;
  fecha: string;
  observacion: string;
  estado: EstadoPedido;
  total: string;
  monto_pagado: string;
  saldo_pendiente: string;
  detalles: DetallePedido[];
}
