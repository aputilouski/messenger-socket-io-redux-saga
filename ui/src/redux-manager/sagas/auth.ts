import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import authSlice, { AuthSlice } from '../slices/auth';
import api, { getErrorMessage } from 'api';
import { LOGIN, LOGOUT, REGISTRATION, LoginCredentials, RegistrationCredentials, StoreAction } from '../actions';
import { RootState } from '../store';
import { replace, LOCATION_CHANGE } from 'connected-react-router';

function* loginWorker(action: StoreAction<LoginCredentials>) {
  yield put(authSlice.actions.runLoading());
  try {
    const response: Awaited<ReturnType<typeof api.login>> = yield call(() => api.login(action.payload));
    yield put(authSlice.actions.login(response.data));
    yield put(replace('/channels'));
  } catch (e) {
    console.error(e);
    yield put(authSlice.actions.catchError(getErrorMessage(e)));
  }
}

function* logoutWorker() {
  yield put(authSlice.actions.logout());
}

function* resetWorker() {
  const path: string = yield select(({ router }: RootState) => router.location.pathname);
  if (['/', '/register'].includes(path)) {
    const auth: AuthSlice = yield select((state: RootState) => state.auth);
    if (auth.error || auth.loading) yield put(authSlice.actions.reset());
  }
}

function* registerWorker(action: StoreAction<RegistrationCredentials>) {
  yield put(authSlice.actions.runLoading());
  try {
    yield call(() => api.register(action.payload));
    yield put(replace('/'));
  } catch (e) {
    console.error(e);
    yield put(authSlice.actions.catchError(getErrorMessage(e)));
  }
}

export default function* authWatcher() {
  yield takeEvery(LOGIN, loginWorker);
  yield takeEvery(LOGOUT, logoutWorker);
  yield takeEvery(REGISTRATION, registerWorker);
  yield takeLatest(LOCATION_CHANGE, resetWorker);
}
