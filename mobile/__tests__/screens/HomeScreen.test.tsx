import React from 'react';
import { Linking } from 'react-native';
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

  it.each([
    ['Tareas', 'Tareas'],
    ['Listado', 'Listado'],
    ['Marcas', 'Marcas'],
    ['Vehículos', 'Catalogo'],
  ])('navigates to %s when its card is pressed', async (label, route) => {
    const { navigation } = await renderHome();
    fireEvent.press(screen.getByText(label));
    expect(navigation.navigate).toHaveBeenCalledWith(route);
  });

  it('opens the Info screen from the "how it works" link', async () => {
    const { navigation } = await renderHome();
    fireEvent.press(screen.getByText('¿Qué hace cada cosa?'));
    expect(navigation.navigate).toHaveBeenCalledWith('Info');
  });

  it('opens the LinkedIn profile from the footer', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);
    await renderHome();
    fireEvent.press(screen.getByText('Julio Albitres'));
    expect(openURL).toHaveBeenCalledWith(expect.stringContaining('linkedin.com/in/julio-albitres-rodriguez'));
    openURL.mockRestore();
  });
});
