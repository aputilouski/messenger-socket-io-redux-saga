import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { createBrowserHistory } from 'history';
import { connectRouter } from 'connected-react-router';
import rootSaga from './sagas';
import authSlice from './slices/auth';
import { useSelector, TypedUseSelectorHook } from 'react-redux';

export const history = createBrowserHistory();

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    router: connectRouter<unknown>(history),
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;

export const useStore: TypedUseSelectorHook<RootState> = useSelector;
