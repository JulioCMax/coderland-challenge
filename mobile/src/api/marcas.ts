import { BACKEND_BASE_URL } from './config';
import type { Marca } from '../types/marca';

export async function fetchMarcas(): Promise<Marca[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/marcas`);
  if (!response.ok) {
    throw new Error(`Failed to fetch marcas: ${response.status}`);
  }
  const data = (await response.json()) as Marca[];
  if (!Array.isArray(data)) {
    throw new Error('Unexpected marcas response shape');
  }
  return data;
}
