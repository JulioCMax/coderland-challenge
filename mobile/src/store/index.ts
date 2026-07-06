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
import tasksReducer from './tasksSlice';

const rootReducer = combineReducers({
  tasks: tasksReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// Plain, non-persisted store used by the test factory — keeps tests isolated.
export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['tasks'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = typeof store.dispatch;
