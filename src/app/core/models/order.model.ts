export interface PedidoClienteInput {
  nombre: string;
  telefono: string;
  email: string;
}

export interface DetallePedidoInput {
  producto: number;
  cantidad: number;
  precio_unitario: string;
}

export interface PedidoInput {
  cliente: PedidoClienteInput;
  region: number | null;
  observacion: string;
  detalles: DetallePedidoInput[];
}

export interface Pedido {
  id: number;
  estado: string;
  total: string;
}
