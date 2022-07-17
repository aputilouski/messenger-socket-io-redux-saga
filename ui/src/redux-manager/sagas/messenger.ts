import { call, take, put, select, fork, all, cancel, cancelled, takeEvery } from 'redux-saga/effects';
import { EventChannel, eventChannel, Task } from 'redux-saga';
import { io, Socket } from 'socket.io-client';
import { StoreAction, StoreActionPromise, USER_SELECT, SEND_MESSAGE } from '../actions';
import authSlice from '../slices/auth';
import messengerSlice from '../slices/messenger';
import { RootState } from '../store';
import { notify } from 'utils';

function subscribe(socket: Socket) {
  return eventChannel(emit => {
    socket.off('connect_error');

    socket.on('rooms', (users: User[]) => {
      emit(messengerSlice.actions.setRooms(users));
    });

    socket.on('chat-messages', (messages: Message[]) => {
      emit(messengerSlice.actions.setChatMessages(messages));
    });

    socket.on('message-created', (message: Message) => {
      emit(messengerSlice.actions.pushMessage(message));
    });

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

function* selectUserWorker(socket: Socket, action: StoreAction<User>) {
  const room: User | undefined = yield select(({ messenger }: RootState) => messenger.chat.meta?.room);
  if (room && room.uuid === action.payload.uuid) return;
  yield put(messengerSlice.actions.selectUser(action.payload));
  socket.emit('chat-messages', action.payload.uuid);
}

function* sendMessageWorker(socket: Socket, action: StoreActionPromise<string>) {
  const { payload, resolve } = action;
  const room: User | undefined = yield select(({ messenger }: RootState) => messenger.chat.meta?.room);
  if (!room) return;
  socket.emit('message-create', { text: payload, to: room.uuid });
  resolve();
}

function* write(socket: Socket) {
  yield takeEvery(USER_SELECT, selectUserWorker, socket);
  yield takeEvery(SEND_MESSAGE, sendMessageWorker, socket);
}

const connect = (token: string) =>
  new Promise((resolve, reject) => {
    const socket = io({ auth: { token } });
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', reject);
  });

function* flow() {
  while (true) {
    const { payload }: { payload: { token: string; user: User } } = yield take(authSlice.actions.login.toString());
    let socket: Socket;
    try {
      socket = yield call(connect, payload.token);
    } catch (error) {
      yield put(authSlice.actions.logout());
      notify.error('Authentication error');
      continue;
    }
    const task: Task = yield all([fork(read, socket), fork(write, socket)]);
    yield take(authSlice.actions.logout.toString());
    yield cancel(task);
  }
}

export default function* messengerSaga() {
  yield fork(flow);
}
