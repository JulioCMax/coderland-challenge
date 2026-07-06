import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';

async function renderHome() {
  const navigation = { navigate: jest.fn() };
  await render(<HomeScreen {...({ navigation } as any)} />);
  return { navigation };
}

describe('HomeScreen', () => {
  it('shows the product title', async () => {
    await renderHome();
    expect(screen.getByText('Tareas y gestión de catálogos')).toBeTruthy();
  });

  it('navigates to Tareas when its button is pressed', async () => {
    const { navigation } = await renderHome();
    fireEvent.press(screen.getByText('Tareas'));
    expect(navigation.navigate).toHaveBeenCalledWith('Tareas');
  });

  it('navigates to Listado when its button is pressed', async () => {
    const { navigation } = await renderHome();
    fireEvent.press(screen.getByText('Listado'));
    expect(navigation.navigate).toHaveBeenCalledWith('Listado');
  });
});
