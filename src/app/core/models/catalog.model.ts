export interface Categoria {
  id: number;
  nombre: string;
}

export interface Marca {
  id: number;
  nombre: string;
}

export interface ProductoFoto {
  id: number;
  url: string;
  principal: boolean;
}

export interface Producto {
  id: number;
  categorias: number[];
  codigo: string;
  nombre: string;
  descripcion: string;
  pais: number;
  marca: number;
  marca_nombre: string;
  fotos: ProductoFoto[];
  peso: string;
  costo: string;
  precio: string;
  stock: number;
  link_referencia: string;
  creado_en: string;
  activo: boolean;
}

export type ProductoInput = Omit<Producto, 'id' | 'creado_en' | 'marca_nombre' | 'fotos'>;
