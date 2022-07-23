import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import authSlice, { AuthSlice } from '../slices/auth';
import messengerSlice from '../slices/messenger';
import api, { getErrorMessage, setAccessToken } from 'api';
import { LOGIN, LOGOUT, REGISTRATION, CHECK_USERNAME, USER_UPDATE, LoginCredentials, RegistrationCredentials, StoreAction, StoreActionPromise } from '../actions';
import { RootState } from '../store';
import { replace, LOCATION_CHANGE } from 'connected-react-router';

function* loginWorker(action: StoreAction<LoginCredentials>) {
  yield put(authSlice.actions.runLoading());
  try {
    const response: Awaited<ReturnType<typeof api.login>> = yield call(() => api.login(action.payload));
    setAccessToken(response.data.token);
    yield put(authSlice.actions.login(response.data));
    yield put(replace('/channels'));
  } catch (error) {
    console.error(error);
    yield put(authSlice.actions.catchError(getErrorMessage(error)));
  }
}

function* logoutWorker() {
  yield put(authSlice.actions.logout());
  yield put(messengerSlice.actions.quit());
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
  } catch (error) {
    console.error(error);
    yield put(authSlice.actions.catchError(getErrorMessage(error)));
  }
}

function* checkUsernameWorker(action: StoreAction<string>) {
  try {
    const response: Awaited<ReturnType<typeof api.checkUsername>> = yield call(() => api.checkUsername(action.payload));
    yield put(authSlice.actions.setUserAvailable(response.data.available));
  } catch (error) {
    console.error(error);
  }
}

function* userUpdateWorker(action: StoreActionPromise<User>) {
  yield put(authSlice.actions.runLoading());
  const { payload, resolve, reject } = action;
  try {
    const response: Awaited<ReturnType<typeof api.updateUser>> = yield call(() => api.updateUser(payload));
    yield put(authSlice.actions.setUser(response.data.user));
    resolve();
  } catch (error) {
    console.error(error);
    yield put(authSlice.actions.catchError(getErrorMessage(error)));
    reject();
  }
}

export default function* authWatcher() {
  yield takeEvery(LOGIN, loginWorker);
  yield takeEvery(LOGOUT, logoutWorker);
  yield takeEvery(REGISTRATION, registerWorker);
  yield takeEvery(CHECK_USERNAME, checkUsernameWorker);
  yield takeEvery(USER_UPDATE, userUpdateWorker);
  yield takeLatest(LOCATION_CHANGE, resetWorker);
}
