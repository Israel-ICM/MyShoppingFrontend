export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  usuario: number | null;
}

export type ClienteInput = Omit<Cliente, 'id'>;
