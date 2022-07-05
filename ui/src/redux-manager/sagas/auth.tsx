import { call, takeEvery, put } from 'redux-saga/effects';
import { store, StoreAction } from '../store';
import authSlice from '../slices/auth';
import api, { getErrorMessage } from 'api';

const LOGIN = 'AUTH/LOGIN';

export type LoginCredentials = { username: string; password: string };

export const login = (payload: LoginCredentials) => store.dispatch({ type: LOGIN, payload });

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

export default function* authSaga() {
  yield takeEvery(LOGIN, loginSaga);
}
