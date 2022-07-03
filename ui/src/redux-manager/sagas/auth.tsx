import { call, takeEvery, put } from 'redux-saga/effects';
import { store, Action } from '../store';
import authSlice from '../slices/auth';
import api from 'api';

const LOGIN = 'AUTH/LOGIN';

export type LoginCredentials = { username: string; password: string };

export const login = (payload: LoginCredentials) => store.dispatch({ type: LOGIN, payload });

function* loginSaga(action: Action<LoginCredentials>) {
  yield put(authSlice.actions.loading(true));
  const result: Promise<any> = yield call(() => api.login(action.payload));
  console.log(result);
}

export default function* authSaga() {
  yield takeEvery(LOGIN, loginSaga);
}
