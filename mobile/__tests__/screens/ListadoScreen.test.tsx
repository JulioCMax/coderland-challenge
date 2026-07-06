import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { flushListTimers } from '../../test-utils';
import ListadoScreen from '../../src/screens/ListadoScreen';
import { fetchElements } from '../../src/api/elements';

jest.mock('../../src/api/elements');
const mockedFetchElements = fetchElements as jest.MockedFunction<typeof fetchElements>;

describe('ListadoScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows the loading layout while the request is pending', async () => {
    mockedFetchElements.mockReturnValue(new Promise(() => {})); // never resolves
    await render(<ListadoScreen />);
    expect(screen.getByText('Cargando...')).toBeTruthy();
  });

  it('fetches on mount and renders element names', async () => {
    mockedFetchElements.mockResolvedValue([
      { id: '1', name: 'Pauline Blanda', avatar: 'https://x/a.jpg' },
      { id: '2', name: 'Marguerite Turner', avatar: 'https://x/b.jpg' },
    ]);
    await render(<ListadoScreen />);
    expect(mockedFetchElements).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Pauline Blanda')).toBeTruthy();
    expect(screen.getByText('Marguerite Turner')).toBeTruthy();
    expect(screen.queryByText('Cargando...')).toBeNull();
    await flushListTimers(); // FlatList rendered — settle its deferred update inside act()
  });

  it('shows a friendly error state when the fetch fails', async () => {
    mockedFetchElements.mockRejectedValue(new Error('network'));
    await render(<ListadoScreen />);
    expect(await screen.findByText('No se pudo cargar el listado.')).toBeTruthy();
  });
});
