export interface Pais {
  id: number;
  nombre: string;
  abreviacion: string;
}

export interface Region {
  id: number;
  nombre: string;
  abreviacion: string;
  pais: number;
}
