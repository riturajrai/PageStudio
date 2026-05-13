import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import draftPageReducer from './slices/draftPageSlice';

const persistConfig = {
  key: 'draftPage',
  storage,
};

const persistedReducer = persistReducer(persistConfig, draftPageReducer);

export const store = configureStore({
  reducer: {
    draftPage: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;