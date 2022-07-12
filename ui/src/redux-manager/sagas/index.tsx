import { spawn } from 'redux-saga/effects';
import authWatcher from './auth';
import messengerSaga from './messenger';

export default function* rootSaga() {
  yield spawn(authWatcher);
  yield spawn(messengerSaga);
}
