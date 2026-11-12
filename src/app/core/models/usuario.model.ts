export interface Usuario {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}

export type UsuarioInput = Omit<Usuario, 'id' | 'date_joined'> & { password?: string };
