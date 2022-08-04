import { call, put, cancel, take, takeEvery, takeLatest, delay } from 'redux-saga/effects';
import { Task } from 'redux-saga';
import authSlice from '../slices/auth';
import messengerSlice from '../slices/messenger';
import api, { getErrorMessage, setAccessToken } from 'api';
import { LOGIN, LOGOUT, REGISTRATION, CHECK_USERNAME, USER_UPDATE, LoginCredentials, RegistrationCredentials, StoreAction, StoreActionPromise } from '../actions';
import { replace } from 'connected-react-router';
import { notify } from 'utils';

function* loginWorker(action: StoreActionPromise<LoginCredentials>) {
  const { payload, resolve, reject } = action;
  try {
    const response: Awaited<ReturnType<typeof api.login>> = yield call(() => api.login(payload));
    yield call(setAccessToken, response.data.token);
    yield put(authSlice.actions.login(response.data));
    yield put(replace('/channels'));
    yield call(resolve);
  } catch (error) {
    yield call(reject, getErrorMessage(error));
    throw error;
  }
}

function* logoutWorker(action: StoreAction) {
  yield put(authSlice.actions.logout());
  yield put(messengerSlice.actions.quit());
}

function* registerWorker(action: StoreActionPromise<RegistrationCredentials>) {
  const { payload, resolve, reject } = action;
  try {
    yield call(() => api.register(payload));
    yield put(replace('/'));
    yield call(resolve);
  } catch (error) {
    console.error(error);
    yield call(reject, getErrorMessage(error));
  }
}

function* checkUsernameWorker(action: StoreActionPromise<string>) {
  const { payload, resolve, reject } = action;
  try {
    yield delay(800);
    const response: Awaited<ReturnType<typeof api.checkUsername>> = yield call(() => api.checkUsername(payload));
    yield call(resolve, response.data.available);
  } catch (error) {
    console.error(error);
    yield call(reject, getErrorMessage(error));
    notify.error(getErrorMessage(error));
  }
}

function* userUpdateWorker(action: StoreActionPromise<User>) {
  const { payload, resolve, reject } = action;
  try {
    const response: Awaited<ReturnType<typeof api.updateUser>> = yield call(() => api.updateUser(payload));
    yield put(authSlice.actions.setUser(response.data.user));
    yield call(resolve);
  } catch (error) {
    console.error(error);
    yield call(reject, getErrorMessage(error));
  }
}

function* authWatcher() {
  yield takeEvery(REGISTRATION, registerWorker);

  yield takeLatest(CHECK_USERNAME, checkUsernameWorker);

  while (true) {
    const loginAction: StoreActionPromise<LoginCredentials> = yield take(LOGIN);
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
