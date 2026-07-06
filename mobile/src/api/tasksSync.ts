import { BACKEND_BASE_URL } from './config';

export interface SyncedTask {
  id: number;
  descripcion: string;
  fechaCreacion: string;
}

export interface SyncResult {
  imported: number;
  skipped: number;
  tasks: SyncedTask[];
}

export async function syncTasks(descriptions: string[]): Promise<SyncResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/tasks/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descripciones: descriptions }),
  });
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }
  return (await response.json()) as SyncResult;
}
