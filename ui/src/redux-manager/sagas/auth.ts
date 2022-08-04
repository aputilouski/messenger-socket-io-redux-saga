import { call, put, select, cancel, take, takeEvery, takeLatest, delay } from 'redux-saga/effects';
import { Task } from 'redux-saga';
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
    yield put(authSlice.actions.catchError(getErrorMessage(error)));
    throw error;
  }
}

function* logoutWorker(action: StoreAction) {
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
    yield delay(800);
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

function* authWatcher() {
  yield takeEvery(REGISTRATION, registerWorker);

  yield takeLatest(CHECK_USERNAME, checkUsernameWorker);

  yield takeLatest(LOCATION_CHANGE, resetWorker);

  while (true) {
    const loginAction: StoreAction<LoginCredentials> = yield take(LOGIN);
    yield call(loginWorker, loginAction);

    const updateUserTask: Task = yield takeEvery(USER_UPDATE, userUpdateWorker);

    const logoutAction: StoreAction = yield take(LOGOUT);
    yield cancel([updateUserTask]);
    yield call(logoutWorker, logoutAction);
  }
}

export default function* main() {
  while (true) {
    try {
      yield call(authWatcher);
    } catch (error) {
      console.error(error);
    }
  }
}
