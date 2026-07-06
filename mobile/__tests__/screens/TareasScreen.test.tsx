import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { flushListTimers, renderWithProviders } from '../../test-utils';
import TareasScreen from '../../src/screens/TareasScreen';
import { setupStore } from '../../src/store';
import { addTask } from '../../src/store/tasksSlice';
import { syncTasks } from '../../src/api/tasksSync';

jest.mock('../../src/api/tasksSync');
const mockedSyncTasks = syncTasks as jest.MockedFunction<typeof syncTasks>;

describe('TareasScreen', () => {
  it('shows the empty state when there are no tasks', async () => {
    await renderWithProviders(<TareasScreen />);
    expect(screen.getByText('No hay tasks todavía.')).toBeTruthy();
    await flushListTimers();
  });

  it('renders tasks that already exist in Redux', async () => {
    const store = setupStore();
    store.dispatch(addTask('Existing task'));
    await renderWithProviders(<TareasScreen />, { store });
    expect(screen.getByText('Existing task')).toBeTruthy();
    await flushListTimers();
  });

  it('adds a task through the modal form', async () => {
    const { store } = await renderWithProviders(<TareasScreen />);
    await fireEvent.press(screen.getByText('Agregar nuevo task'));
    // fireEvent is async in RTL v14 and must be awaited, otherwise the next
    // interaction can race the pending act() flush and observe stale state:
    await fireEvent.changeText(await screen.findByPlaceholderText('Descripción'), 'Walk the dog');
    await fireEvent.press(screen.getByText('Guardar'));
    // The dispatch runs synchronously inside the press handler, so the store is updated immediately:
    expect(store.getState().tasks.items.map((t) => t.description)).toEqual(['Walk the dog']);
    // The re-render is async — wait for the item to appear in the list:
    expect(await screen.findByText('Walk the dog')).toBeTruthy();
    await flushListTimers();
  });

  it('does not add a task when the description is empty', async () => {
    const { store } = await renderWithProviders(<TareasScreen />);
    await fireEvent.press(screen.getByText('Agregar nuevo task'));
    await screen.findByPlaceholderText('Descripción');
    await fireEvent.press(screen.getByText('Guardar')); // input left empty
    expect(store.getState().tasks.items).toHaveLength(0);
    await flushListTimers();
  });

  it('does not add a task when the description is only whitespace', async () => {
    const { store } = await renderWithProviders(<TareasScreen />);
    await fireEvent.press(screen.getByText('Agregar nuevo task'));
    await fireEvent.changeText(await screen.findByPlaceholderText('Descripción'), '   ');
    await fireEvent.press(screen.getByText('Guardar')); // input left whitespace-only
    expect(store.getState().tasks.items).toHaveLength(0);
    await flushListTimers();
  });

  it('keeps tasks across unmount/remount with the same store (navigation persistence)', async () => {
    const store = setupStore();
    const first = await renderWithProviders(<TareasScreen />, { store });
    await fireEvent.press(screen.getByText('Agregar nuevo task'));
    await fireEvent.changeText(await screen.findByPlaceholderText('Descripción'), 'Persisted');
    await fireEvent.press(screen.getByText('Guardar'));
    expect(await screen.findByText('Persisted')).toBeTruthy();
    // unmount() is also async in RTL v14 (it awaits act() internally); unawaited it
    // races the next render's act() scope and produces "overlapping act()" warnings.
    await first.unmount();

    await renderWithProviders(<TareasScreen />, { store });
    expect(await screen.findByText('Persisted')).toBeTruthy();
    await flushListTimers();
  });
});

describe('TareasScreen — sync (bonus)', () => {
  afterEach(() => jest.clearAllMocks());

  it('syncs the current task descriptions to the backend', async () => {
    mockedSyncTasks.mockResolvedValue({ imported: 1, skipped: 0, tasks: [] });
    const store = setupStore();
    store.dispatch(addTask('Sync me'));
    await renderWithProviders(<TareasScreen />, { store });

    await fireEvent.press(screen.getByText('Sincronizar'));
    expect(mockedSyncTasks).toHaveBeenCalledWith(['Sync me']);
    expect(await screen.findByText('Sincronizado: 1 nuevas, 0 ya existían.')).toBeTruthy();
    await flushListTimers();
  });

  it('shows a graceful message when sync fails', async () => {
    mockedSyncTasks.mockRejectedValue(new Error('offline'));
    const store = setupStore();
    store.dispatch(addTask('Sync me'));
    await renderWithProviders(<TareasScreen />, { store });

    await fireEvent.press(screen.getByText('Sincronizar'));
    expect(await screen.findByText('No se pudo sincronizar. El backend no está disponible.')).toBeTruthy();
    await flushListTimers();
  });
});
