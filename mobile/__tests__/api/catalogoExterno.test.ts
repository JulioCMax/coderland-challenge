import { fetchMarcasExternas, fetchModelos } from '../../src/api/catalogoExterno';

describe('fetchMarcasExternas', () => {
  afterEach(() => jest.restoreAllMocks());

  it('requests /api/marcas/externas on the configured backend base URL', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => [] } as unknown as Response);
    await fetchMarcasExternas();
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/marcas/externas');
  });

  it('returns the parsed brands on success', async () => {
    const data = [{ id: 448, nombre: 'TOYOTA' }];
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => data } as unknown as Response);
    await expect(fetchMarcasExternas()).resolves.toEqual(data);
  });

  it('throws when the backend responds with a 502 (vPIC unreachable)', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: false, status: 502, json: async () => ({}) } as unknown as Response);
    await expect(fetchMarcasExternas()).rejects.toThrow('502');
  });

  it('throws when the response body is a 200 but not an array', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => ({ not: 'an array' }) } as unknown as Response);
    await expect(fetchMarcasExternas()).rejects.toThrow('shape');
  });
});

describe('fetchModelos', () => {
  afterEach(() => jest.restoreAllMocks());

  it('url-encodes the brand into the /modelos route', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => [] } as unknown as Response);
    await fetchModelos('Mercedes-Benz');
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/marcas/externas/Mercedes-Benz/modelos');
  });

  it('returns the parsed models on success', async () => {
    const data = [{ id: 1, nombre: 'Corolla', marca: 'Toyota' }];
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => data } as unknown as Response);
    await expect(fetchModelos('Toyota')).resolves.toEqual(data);
  });

  it('throws when the backend responds with an error', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: false, status: 502, json: async () => ({}) } as unknown as Response);
    await expect(fetchModelos('Toyota')).rejects.toThrow('502');
  });
});
