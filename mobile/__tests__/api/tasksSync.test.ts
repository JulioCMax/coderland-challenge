import { syncTasks } from '../../src/api/tasksSync';

describe('syncTasks', () => {
  afterEach(() => jest.restoreAllMocks());

  it('POSTs the descriptions to /api/tasks/sync on the backend', async () => {
    const result = { imported: 2, skipped: 0, tasks: [] };
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => result } as unknown as Response);

    await expect(syncTasks(['A', 'B'])).resolves.toEqual(result);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/tasks/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descripciones: ['A', 'B'] }),
    });
  });

  it('throws when the backend responds with an error', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: false, status: 500, json: async () => ({}) } as unknown as Response);
    await expect(syncTasks(['A'])).rejects.toThrow('500');
  });
});
