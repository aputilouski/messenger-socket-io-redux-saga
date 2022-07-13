import { call, take, put, fork, all, cancel, cancelled } from 'redux-saga/effects';
import { EventChannel, eventChannel, Task } from 'redux-saga';
import { io, Socket } from 'socket.io-client';
import { StoreAction } from '../actions';
import authSlice from '../slices/auth';

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
    return () => socket.disconnect();
  });
}

function* read(socket: Socket) {
  const channel: EventChannel<Socket> = yield call(subscribe, socket);
  try {
    while (true) {
      const action: StoreAction = yield take(channel);
      yield put(action);
    }
  } finally {
    const result: boolean = yield cancelled();
    if (result) channel.close();
  }
}

function* write(socket: Socket) {
  // while (true) {
  //   const { payload } = yield take(`${sendMessage}`);
  //   socket.emit('message', payload);
  // }
}

function connect(token: string) {
  const socket = io();
  socket.auth = { token };
  return new Promise(resolve => socket.on('connect', () => resolve(socket)));
}

function* flow() {
  while (true) {
    const { payload }: { payload: { token: string; user: User } } = yield take(authSlice.actions.login.toString());
    const socket: Socket = yield call(connect, payload.token);
    const task: Task = yield all([fork(read, socket), fork(write, socket)]);
    yield take(authSlice.actions.logout.toString());
    yield cancel(task);
  }
}

export default function* messengerSaga() {
  yield fork(flow);
}
