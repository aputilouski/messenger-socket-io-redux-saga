import { call, takeEvery, put, select } from 'redux-saga/effects';
import authSlice, { AuthSlice } from '../slices/auth';
import api, { getErrorMessage } from 'api';
import { LOGIN, LOGOUT, LoginCredentials, StoreAction, AUTH_RESET } from '../actions';
import { RootState } from '../store';

function* loginWorker(action: StoreAction<LoginCredentials>) {
  yield put(authSlice.actions.runLoading());
  try {
    const response: Awaited<ReturnType<typeof api.login>> = yield call(() => api.login(action.payload));
    yield put(authSlice.actions.login(response.data));
  } catch (e) {
    console.error(e);
    yield put(authSlice.actions.catchError(getErrorMessage(e)));
  }
}

function* logoutWorker() {
  yield put(authSlice.actions.logout());
}

function* resetWorker() {
  const auth: AuthSlice = yield select((state: RootState) => state.auth);
  if (auth.error || auth.loading) yield put(authSlice.actions.reset());
}

export default function* authWatcher() {
  yield takeEvery(LOGIN, loginWorker);
  yield takeEvery(LOGOUT, logoutWorker);
  yield takeEvery(AUTH_RESET, resetWorker);
}
