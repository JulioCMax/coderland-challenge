import { ELEMENTS_URL, fetchElements } from '../../src/api/elements';

describe('fetchElements', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('requests the exact mandated mockapi URL', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => [] } as unknown as Response);
    await fetchElements();
    expect(fetchMock).toHaveBeenCalledWith('https://6172cfe5110a740017222e2b.mockapi.io/elements');
    expect(ELEMENTS_URL).toBe('https://6172cfe5110a740017222e2b.mockapi.io/elements');
  });

  it('returns the parsed array on success', async () => {
    const data = [{ id: '1', name: 'Pauline Blanda', avatar: 'https://x/a.jpg', createdAt: '2021-10-22' }];
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => data } as unknown as Response);
    await expect(fetchElements()).resolves.toEqual(data);
  });

  it('throws when the response is not ok', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: false, status: 500, json: async () => ({}) } as unknown as Response);
    await expect(fetchElements()).rejects.toThrow('500');
  });
});
