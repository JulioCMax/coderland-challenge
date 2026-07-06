import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../test-utils';
import TareasScreen from '../../src/screens/TareasScreen';
import { setupStore } from '../../src/store';
import { addTask } from '../../src/store/tasksSlice';

describe('TareasScreen', () => {
  it('shows the empty state when there are no tasks', async () => {
    await renderWithProviders(<TareasScreen />);
    expect(screen.getByText('No hay tasks todavía.')).toBeTruthy();
  });

  it('renders tasks that already exist in Redux', async () => {
    const store = setupStore();
    store.dispatch(addTask('Existing task'));
    await renderWithProviders(<TareasScreen />, { store });
    expect(screen.getByText('Existing task')).toBeTruthy();
  });

  it('adds a task through the modal form', async () => {
    const { store } = await renderWithProviders(<TareasScreen />);
    fireEvent.press(screen.getByText('Agregar nuevo task'));
    // fireEvent is async in RTL v14 and must be awaited, otherwise the next
    // interaction can race the pending act() flush and observe stale state:
    await fireEvent.changeText(await screen.findByPlaceholderText('Descripción'), 'Walk the dog');
    fireEvent.press(screen.getByText('Guardar'));
    // The dispatch runs synchronously inside the press handler, so the store is updated immediately:
    expect(store.getState().tasks.items.map((t) => t.description)).toEqual(['Walk the dog']);
    // The re-render is async — wait for the item to appear in the list:
    expect(await screen.findByText('Walk the dog')).toBeTruthy();
  });

  it('does not add a task when the description is empty', async () => {
    const { store } = await renderWithProviders(<TareasScreen />);
    fireEvent.press(screen.getByText('Agregar nuevo task'));
    await screen.findByPlaceholderText('Descripción');
    fireEvent.press(screen.getByText('Guardar')); // input left empty
    expect(store.getState().tasks.items).toHaveLength(0);
  });

  it('keeps tasks across unmount/remount with the same store (navigation persistence)', async () => {
    const store = setupStore();
    const first = await renderWithProviders(<TareasScreen />, { store });
    fireEvent.press(screen.getByText('Agregar nuevo task'));
    await fireEvent.changeText(await screen.findByPlaceholderText('Descripción'), 'Persisted');
    fireEvent.press(screen.getByText('Guardar'));
    expect(await screen.findByText('Persisted')).toBeTruthy();
    first.unmount();

    await renderWithProviders(<TareasScreen />, { store });
    expect(await screen.findByText('Persisted')).toBeTruthy();
  });
});
