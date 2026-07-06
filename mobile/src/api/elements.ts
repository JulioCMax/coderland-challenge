import type { Element } from '../types/element';

export const ELEMENTS_URL = 'https://6172cfe5110a740017222e2b.mockapi.io/elements';

export async function fetchElements(): Promise<Element[]> {
  const response = await fetch(ELEMENTS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch elements: ${response.status}`);
  }
  const data = (await response.json()) as Element[];
  if (!Array.isArray(data)) {
    throw new Error('Unexpected elements response shape');
  }
  return data;
}
