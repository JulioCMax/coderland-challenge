import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistReducer,
  persistStore,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store, persistor } from '../../src/store';
import tasksReducer, { addTask, selectTasks } from '../../src/store/tasksSlice';
import type { RootState } from '../../src/store';

describe('persisted store', () => {
  beforeEach(async () => {
    // Drain any write the app-level singleton persistor has queued (real
    // setInterval-based throttle in redux-persist) before wiping storage, so
    // it can't race with the round-trip test's own writes under the same
    // 'root' persist key.
    await persistor.flush();
    await AsyncStorage.clear();
  });

  it('exposes a persistor with a purge method', () => {
    expect(typeof persistor.purge).toBe('function');
  });

  it('still reduces addTask correctly through the persisted reducer', () => {
    store.dispatch(addTask('Persisted-store task'));
    expect(selectTasks(store.getState()).some((t) => t.description === 'Persisted-store task')).toBe(true);
  });

  it('rehydrates a task written by one store instance into a fresh store instance', async () => {
    const rootReducer = combineReducers({ tasks: tasksReducer });
    const persistConfig = {
      key: 'root',
      storage: AsyncStorage,
      whitelist: ['tasks'],
      timeout: 0,
    };
    const persistedReducer = persistReducer(persistConfig, rootReducer);

    const firstStore = configureStore({
      reducer: persistedReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          },
        }),
    });

    // redux-persist only queues state for the persistoid once the store's own
    // rehydration has completed (`_persist.rehydrated`) — dispatching before
    // that resolves is silently dropped, never reaching storage. Wait for the
    // bootstrap callback before dispatching, same as the app would behind a
    // PersistGate.
    const firstPersistor = await new Promise<ReturnType<typeof persistStore>>((resolve) => {
      const p = persistStore(firstStore, null, () => resolve(p));
    });

    firstStore.dispatch(addTask('Survives restart'));
    await firstPersistor.flush();

    const secondStore = configureStore({
      reducer: persistedReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          },
        }),
    });

    await new Promise((resolve) => {
      persistStore(secondStore, null, () => resolve(undefined));
    });

    const rehydratedTasks = selectTasks(secondStore.getState() as RootState);
    expect(rehydratedTasks.some((t) => t.description === 'Survives restart')).toBe(true);
  });
});
