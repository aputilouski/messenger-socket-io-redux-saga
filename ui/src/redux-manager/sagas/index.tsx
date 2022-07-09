import { spawn } from 'redux-saga/effects';
import authSaga from './auth';
import messengerSaga from './messenger';

export default function* rootSaga() {
  yield spawn(authSaga);
  yield spawn(messengerSaga);
}
