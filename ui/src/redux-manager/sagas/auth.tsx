import { call, takeEvery, put } from 'redux-saga/effects';
import authSlice from '../slices/auth';
import api, { getErrorMessage } from 'api';
import { LOGIN, LOGOUT, LoginCredentials, StoreAction } from '../actions';

function* loginSaga(action: StoreAction<LoginCredentials>) {
  yield put(authSlice.actions.runLoading());
  try {
    const response: Awaited<ReturnType<typeof api.login>> = yield call(() => api.login(action.payload));
    yield put(authSlice.actions.login(response.data));
  } catch (e) {
    console.error(e);
    yield put(authSlice.actions.catchError(getErrorMessage(e)));
  }
}

function* logoutSaga() {
  yield put(authSlice.actions.logout());
}

export default function* authSaga() {
  yield takeEvery(LOGIN, loginSaga);
  yield takeEvery(LOGOUT, logoutSaga);
}
