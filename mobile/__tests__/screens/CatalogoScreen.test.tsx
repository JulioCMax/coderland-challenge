import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { flushListTimers } from '../../test-utils';
import CatalogoScreen from '../../src/screens/CatalogoScreen';
import { fetchMarcasExternas } from '../../src/api/catalogoExterno';

jest.mock('../../src/api/catalogoExterno');
const mockedFetch = fetchMarcasExternas as jest.MockedFunction<typeof fetchMarcasExternas>;

async function renderCatalogo() {
  const navigation = { navigate: jest.fn() };
  await render(<CatalogoScreen {...({ navigation } as any)} />);
  return { navigation };
}

describe('CatalogoScreen', () => {
  afterEach(() => jest.clearAllMocks());

  it('shows the loading layout while fetching', async () => {
    mockedFetch.mockReturnValue(new Promise(() => {}));
    await renderCatalogo();
    expect(screen.getByText('Cargando...')).toBeTruthy();
  });

  it('renders brand names and navigates to Modelos on press', async () => {
    mockedFetch.mockResolvedValue([
      { id: 448, nombre: 'TOYOTA' },
      { id: 449, nombre: 'FORD' },
    ]);
    const { navigation } = await renderCatalogo();
    expect(await screen.findByText('TOYOTA')).toBeTruthy();
    // fireEvent is async in RTL v14 — un-awaited it leaves an overlapping act() that
    // corrupts later tests in the file (the component settles a fetch asynchronously).
    await fireEvent.press(screen.getByText('TOYOTA'));
    expect(navigation.navigate).toHaveBeenCalledWith('Modelos', { marca: 'TOYOTA' });
    await flushListTimers();
  });

  it('filters brands by the search query', async () => {
    mockedFetch.mockResolvedValue([
      { id: 448, nombre: 'TOYOTA' },
      { id: 449, nombre: 'FORD' },
    ]);
    await renderCatalogo();
    await screen.findByText('TOYOTA');
    await fireEvent.changeText(screen.getByPlaceholderText('Buscar marca...'), 'for');
    expect(await screen.findByText('FORD')).toBeTruthy();
    expect(screen.queryByText('TOYOTA')).toBeNull();
    await flushListTimers();
  });

  it('shows a graceful error state when the backend/vPIC is unreachable', async () => {
    mockedFetch.mockRejectedValue(new Error('502'));
    await renderCatalogo();
    expect(await screen.findByText('No se pudo cargar el catálogo externo.')).toBeTruthy();
  });
});
