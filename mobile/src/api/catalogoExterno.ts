import { BACKEND_BASE_URL } from './config';
import type { MarcaExterna, Modelo } from '../types/catalogoExterno';

/** Live vehicle brands from the backend's vPIC read-through endpoint (never persisted). */
export async function fetchMarcasExternas(): Promise<MarcaExterna[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/marcas/externas`);
  if (!response.ok) {
    throw new Error(`Failed to fetch marcas externas: ${response.status}`);
  }
  const data = (await response.json()) as MarcaExterna[];
  if (!Array.isArray(data)) {
    throw new Error('Unexpected marcas externas response shape');
  }
  return data;
}

/** Live models for one brand, fetched on demand from the backend's vPIC read-through endpoint. */
export async function fetchModelos(marca: string): Promise<Modelo[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/marcas/externas/${encodeURIComponent(marca)}/modelos`);
  if (!response.ok) {
    throw new Error(`Failed to fetch modelos: ${response.status}`);
  }
  const data = (await response.json()) as Modelo[];
  if (!Array.isArray(data)) {
    throw new Error('Unexpected modelos response shape');
  }
  return data;
}
