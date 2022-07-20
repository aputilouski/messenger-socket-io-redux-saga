import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { createBrowserHistory, History, Location } from 'history';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import rootSaga from './sagas';
import authSlice from './slices/auth';
import messengerSlice from './slices/messenger';
import { useSelector, TypedUseSelectorHook } from 'react-redux';

// fix for react dev server hot updates
export const createUniversalHistory = (): History<Location> => {
  const history = window.browserHistory || createBrowserHistory();
  if (process.env.NODE_ENV === 'development' && !window.browserHistory) {
    window.browserHistory = history;
  }
  return history;
};

export const history = createUniversalHistory();

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    router: connectRouter<Location>(history),
    auth: authSlice.reducer,
    messenger: messengerSlice.reducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(routerMiddleware(history), sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;

export const useStore: TypedUseSelectorHook<RootState> = useSelector;

const messageMap = new Map<string, Message[]>();
export const messageStore = {
  getMessages: messageMap.get.bind(messageMap),
  setMessages: messageMap.set.bind(messageMap),
  pushMessage: (uuid: string, message: Message) => {
    const messages = messageMap.get(uuid);
    if (messages) messages.unshift(message);
    else messageMap.set(uuid, [message]);
  },
};
