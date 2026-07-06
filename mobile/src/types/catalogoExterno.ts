/** External vehicle brand served live by the backend's vPIC read-through catalog. */
export interface MarcaExterna {
  id: number;
  nombre: string;
}

/** External vehicle model for a given brand, served live from vPIC (not persisted). */
export interface Modelo {
  id: number;
  nombre: string;
  marca: string;
}
