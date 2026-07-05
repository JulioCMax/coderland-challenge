import React, { type PropsWithChildren, type ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { setupStore, type AppStore, type RootState } from './src/store';

interface Options {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

// RTL v14's render is async, so this helper is async too. Always `await renderWithProviders(...)`.
export async function renderWithProviders(
  ui: ReactElement,
  { preloadedState, store = setupStore(preloadedState) }: Options = {},
) {
  function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...(await render(ui, { wrapper: Wrapper })) };
}
