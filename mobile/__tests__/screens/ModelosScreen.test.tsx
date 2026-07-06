import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { flushListTimers } from '../../test-utils';
import ModelosScreen from '../../src/screens/ModelosScreen';
import { fetchModelos } from '../../src/api/catalogoExterno';

jest.mock('../../src/api/catalogoExterno');
const mockedFetch = fetchModelos as jest.MockedFunction<typeof fetchModelos>;

async function renderModelos(marca = 'Toyota') {
  await render(<ModelosScreen {...({ route: { params: { marca } } } as any)} />);
}

describe('ModelosScreen', () => {
  afterEach(() => jest.clearAllMocks());

  it('fetches models for the brand taken from the route param', async () => {
    mockedFetch.mockResolvedValue([]);
    await renderModelos('Ford');
    expect(mockedFetch).toHaveBeenCalledWith('Ford');
    await flushListTimers();
  });

  it('shows the loading layout while fetching', async () => {
    mockedFetch.mockReturnValue(new Promise(() => {}));
    await renderModelos();
    expect(screen.getByText('Cargando...')).toBeTruthy();
  });

  it('renders model names on success', async () => {
    mockedFetch.mockResolvedValue([
      { id: 1, nombre: 'Corolla', marca: 'Toyota' },
      { id: 2, nombre: 'Camry', marca: 'Toyota' },
    ]);
    await renderModelos();
    expect(await screen.findByText('Corolla')).toBeTruthy();
    expect(screen.getByText('Camry')).toBeTruthy();
    await flushListTimers();
  });

  it('shows an empty state when the brand reports no models', async () => {
    mockedFetch.mockResolvedValue([]);
    await renderModelos('Tesla');
    expect(await screen.findByText('Tesla no reporta modelos en vPIC.')).toBeTruthy();
    await flushListTimers();
  });

  it('degrades gracefully when the fetch fails', async () => {
    mockedFetch.mockRejectedValue(new Error('502'));
    await renderModelos();
    expect(await screen.findByText('No se pudieron cargar los modelos.')).toBeTruthy();
  });
});
