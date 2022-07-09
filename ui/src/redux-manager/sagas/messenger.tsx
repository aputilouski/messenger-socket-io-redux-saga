import { call, take, put, fork, all, cancel } from 'redux-saga/effects';
import { EventChannel, eventChannel, Task } from 'redux-saga';
import { io, Socket } from 'socket.io-client';
import { LOGIN, LOGOUT, StoreAction } from '../actions';

function subscribe(socket: Socket) {
  return eventChannel(emit => {
    //   socket.on('users.login', ({ username }) => {
    //     emit(addUser({ username }));
    //   });
    //   socket.on('users.logout', ({ username }) => {
    //     emit(removeUser({ username }));
    //   });
    //   socket.on('messages.new', ({ message }) => {
    //     emit(newMessage({ message }));
    //   });
    //   socket.on('disconnect', e => {
    //     // TODO: handle
    //   });
    return () => {};
  });
}

function* read(socket: Socket) {
  const channel: EventChannel<Socket> = yield call(subscribe, socket);
  while (true) {
    const action: StoreAction = yield take(channel);
    yield put(action);
  }
}

function* write(socket: Socket) {
  // while (true) {
  //   const { payload } = yield take(`${sendMessage}`);
  //   socket.emit('message', payload);
  // }
}

function connect() {
  const socket = io();
  return new Promise(resolve => socket.on('connect', () => resolve(socket)));
}

function* flow() {
  while (true) {
    // const { payload }: StoreAction<LoginCredentials> = yield take(LOGIN);
    yield take(LOGIN);
    const socket: Socket = yield call(connect);
    const task: Task = yield all([fork(read, socket), fork(write, socket)]);
    yield take(LOGOUT);
    yield cancel(task);
  }
}

export default function* messengerSaga() {
  yield fork(flow);
  // yield takeEvery(LOGIN, loginSaga);
}
