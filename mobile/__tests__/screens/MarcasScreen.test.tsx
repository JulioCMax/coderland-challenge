import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { flushListTimers } from '../../test-utils';
import MarcasScreen from '../../src/screens/MarcasScreen';
import { fetchMarcas } from '../../src/api/marcas';

jest.mock('../../src/api/marcas');
const mockedFetchMarcas = fetchMarcas as jest.MockedFunction<typeof fetchMarcas>;

describe('MarcasScreen', () => {
  afterEach(() => jest.clearAllMocks());

  it('announces that the catalog is served by the backend', async () => {
    mockedFetchMarcas.mockReturnValue(new Promise(() => {}));
    await render(<MarcasScreen />);
    expect(screen.getByText('Catálogo servido por el backend')).toBeTruthy();
  });

  it('shows a loading layout while fetching', async () => {
    mockedFetchMarcas.mockReturnValue(new Promise(() => {}));
    await render(<MarcasScreen />);
    expect(screen.getByText('Cargando...')).toBeTruthy();
  });

  it('renders brand names on success', async () => {
    mockedFetchMarcas.mockResolvedValue([
      { id: 1, nombre: 'Toyota', paisOrigen: 'Japan', fechaCreacion: '2026-01-01T00:00:00Z' },
      { id: 2, nombre: 'Ford', paisOrigen: 'USA', fechaCreacion: '2026-01-01T00:00:00Z' },
    ]);
    await render(<MarcasScreen />);
    expect(await screen.findByText('Toyota')).toBeTruthy();
    expect(screen.getByText('Ford')).toBeTruthy();
    await flushListTimers(); // FlatList rendered — settle its deferred update inside act()
  });

  it('degrades gracefully (no crash) when the backend is unreachable', async () => {
    mockedFetchMarcas.mockRejectedValue(new Error('ECONNREFUSED'));
    await render(<MarcasScreen />);
    expect(
      await screen.findByText('No se pudo conectar con el backend. Probá de nuevo más tarde.'),
    ).toBeTruthy();
  });
});
