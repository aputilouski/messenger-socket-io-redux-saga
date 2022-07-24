import { call, take, put, select, fork, all, cancel, cancelled, takeEvery } from 'redux-saga/effects';
import { EventChannel, eventChannel, Task } from 'redux-saga';
import { io, Socket } from 'socket.io-client';
import { StoreAction, StoreActionPromise, SELECT_ROOM, SEND_MESSAGE, LOAD_MORE, READ_MESSAGES } from '../actions';
import authSlice from '../slices/auth';
import messengerSlice, { MessengerSlice } from '../slices/messenger';
import { RootState } from '../store';
import { notify, MESSAGES_LIMIT } from 'utils';

function subscribe(socket: Socket) {
  return eventChannel(emit => {
    socket.off('connect_error');

    socket.on('initialization', (rooms: Room[], companions: Companion[]) => {
      emit(messengerSlice.actions.init({ rooms, companions }));
    });

    socket.on('user:connected', (uuid: string) => {
      emit(messengerSlice.actions.companionConnect({ uuid, connected: true }));
    });

    socket.on('user:disconnected', (uuid: string, disconnected_at) => {
      emit(messengerSlice.actions.companionConnect({ uuid, connected: false, disconnected_at }));
    });

    socket.on('messages', (roomID: number, messages: Message[]) => {
      emit(messengerSlice.actions.pushRoomMessages({ messages, roomID }));
    });

    socket.on('message:created', (roomID: number, message: Message) => {
      emit(messengerSlice.actions.pushRoomMessage({ roomID, message }));
    });

    socket.on('messages:read', (uuid: string, last_read: any) => {
      emit(messengerSlice.actions.setCompanionLastRead({ uuid, last_read }));
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

function* selectRoom(socket: Socket, action: StoreAction<number>) {
  const roomID = action.payload;
  const messenger: MessengerSlice = yield select(({ messenger }: RootState) => messenger);
  if (messenger.chat.roomID === roomID) return;
  const room = messenger.rooms?.find(room => room.id === roomID);
  if (!room || room.messages.length >= MESSAGES_LIMIT) return;
  yield put(messengerSlice.actions.selectRoom({ roomID, loading: !room.initialized }));
  if (room.unread_count !== 0) yield put(messengerSlice.actions.setRoomUnreadCount({ roomID }));
  if (!room.initialized) socket.emit('messages', roomID, room.messages.length, MESSAGES_LIMIT);
}

function* sendMessage(socket: Socket, action: StoreActionPromise<string>) {
  const { payload, resolve } = action;
  const room_id: number = yield select(({ messenger }: RootState) => messenger.chat.roomID);
  socket.emit('message:create', { text: payload, room_id });
  resolve();
}

function* loadMore(socket: Socket) {
  const messenger: MessengerSlice = yield select(({ messenger }: RootState) => messenger);
  const roomID = messenger.chat.roomID;
  const room = messenger.rooms?.find(room => room.id === roomID);
  if (!room) return;
  const offset = room.messages.length;
  socket.emit('messages', roomID, offset, MESSAGES_LIMIT);
}

function* readMessages(socket: Socket) {
  const roomID: number = yield select(({ messenger }: RootState) => messenger.chat.roomID);
  socket.emit('messages:read', roomID);
}

function* write(socket: Socket) {
  yield takeEvery(SELECT_ROOM, selectRoom, socket);
  yield takeEvery(SEND_MESSAGE, sendMessage, socket);
  yield takeEvery(LOAD_MORE, loadMore, socket);
  yield takeEvery(READ_MESSAGES, readMessages, socket);
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
