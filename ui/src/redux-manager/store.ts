import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { createBrowserHistory, Location } from 'history';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import rootSaga from './sagas';
import authSlice from './slices/auth';
import { useSelector, TypedUseSelectorHook } from 'react-redux';

export const history = createBrowserHistory<Location>();

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    router: connectRouter<Location>(history),
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(routerMiddleware(history), sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;

export const useStore: TypedUseSelectorHook<RootState> = useSelector;
