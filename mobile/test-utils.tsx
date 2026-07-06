import React, { type PropsWithChildren, type ReactElement } from 'react';
import { act, render } from '@testing-library/react-native';
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

// Flushes VirtualizedList's deferred setState (a real ~50ms setTimeout) inside act(),
// so FlatList updates don't leak past the test as "not wrapped in act(...)" warnings.
export async function flushListTimers() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 60));
  });
}
