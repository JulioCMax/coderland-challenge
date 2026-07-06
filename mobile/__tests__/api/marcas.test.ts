import { fetchMarcas } from '../../src/api/marcas';

describe('fetchMarcas', () => {
  afterEach(() => jest.restoreAllMocks());

  it('requests /api/marcas on the configured backend base URL', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => [] } as unknown as Response);
    await fetchMarcas();
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/marcas');
  });

  it('returns the parsed brands on success', async () => {
    const data = [{ id: 1, nombre: 'Toyota', paisOrigen: 'Japan', fechaCreacion: '2026-01-01T00:00:00Z' }];
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => data } as unknown as Response);
    await expect(fetchMarcas()).resolves.toEqual(data);
  });

  it('throws when the backend responds with an error', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: false, status: 502, json: async () => ({}) } as unknown as Response);
    await expect(fetchMarcas()).rejects.toThrow('502');
  });

  it('throws when the response body is a 200 but not an array', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => ({ not: 'an array' }) } as unknown as Response);
    await expect(fetchMarcas()).rejects.toThrow('shape');
  });
});
