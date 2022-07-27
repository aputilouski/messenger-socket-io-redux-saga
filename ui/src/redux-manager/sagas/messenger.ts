import { call, take, put, select, fork, all, cancel, cancelled, takeEvery } from 'redux-saga/effects';
import { EventChannel, eventChannel, Task } from 'redux-saga';
import { io, Socket } from 'socket.io-client';
import { StoreAction, StoreActionPromise, SELECT_ROOM, DESELECT_ROOM, SEND_MESSAGE, LOAD_MORE, READ_MESSAGES, SEARCH, SELECT_COMPANION, MESSAGE_PUSH, selectRoom as selectRoomAction } from '../actions';
import authSlice from '../slices/auth';
import messengerSlice, { MessengerSlice } from '../slices/messenger';
import { RootState } from '../store';
import { notify, MESSAGES_LIMIT, shout } from 'utils';

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
      emit({ type: MESSAGE_PUSH, payload: { roomID, message } });
    });

    socket.on('messages:read', (uuid: string, last_read: any) => {
      emit(messengerSlice.actions.setCompanionLastRead({ uuid, last_read }));
    });

    socket.on('search', (result?: { rows: User[]; count: number }) => {
      if (result) emit(messengerSlice.actions.setSearchResult(result.rows));
      else emit(messengerSlice.actions.clearSearch());
    });

    socket.on('room:new', (room: Room, companion: Companion, autoSelect: boolean) => {
      emit(messengerSlice.actions.pushRoom({ room, companion }));
      emit(messengerSlice.actions.clearSearch());
      if (autoSelect) emit(messengerSlice.actions.selectRoom({ roomID: room.id, loading: false }));
      socket.emit('subscribe', companion);
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
  if (!room) return;
  yield put(messengerSlice.actions.selectRoom({ roomID, loading: !room.initialized }));
  if (room.unread_count !== 0) yield put(messengerSlice.actions.setRoomUnreadCount({ roomID }));
  if (!room.initialized) socket.emit('messages', roomID, room.messages.length, MESSAGES_LIMIT);
}

function* deselectRoom(socket: Socket) {
  yield put(messengerSlice.actions.deselectRoom());
}

function* sendMessage(socket: Socket, action: StoreActionPromise<string>) {
  const { payload, resolve } = action;
  const { chat, search }: MessengerSlice = yield select(({ messenger }: RootState) => messenger);
  if (search?.companionID) socket.emit('room:new', search.companionID, payload);
  else socket.emit('message:create', { text: payload, room_id: chat.roomID });
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

function* search(socket: Socket, action: StoreAction<string>) {
  const text = action.payload;
  if (!text) yield put(messengerSlice.actions.clearSearch());
  else {
    socket.emit('search', text);
    const { rooms, companions }: MessengerSlice = yield select(({ messenger }: RootState) => messenger);
    if (rooms) {
      const result: Room[] = rooms.filter(room => {
        const companion = companions.find(user => user.uuid === room.companion);
        if (!companion) return false;
        const words = companion.name.split(' ').filter(w => Boolean(w));
        words.unshift(companion.username);
        words.push(companion.name);
        return words.some(w => w.startsWith(text));
      });
      yield put(messengerSlice.actions.setSearchRooms(result));
    }
  }
}

function* selectCompanion(socket: Socket, action: StoreAction<string>) {
  yield put(messengerSlice.actions.selectCompanion(action.payload));
}

function* messagePush(action: StoreAction<{ roomID: number; message: Message }>) {
  const { roomID, message } = action.payload;
  const messenger: MessengerSlice = yield select(({ messenger }: RootState) => messenger);
  if (roomID === messenger.chat.roomID) return;
  const room = messenger.rooms?.find(room => room.id === roomID);
  if (!room) return;
  const companion = messenger.companions.find(c => c.uuid === room.companion);
  if (!companion) return;
  shout({ title: companion.name, text: message.text }, () => selectRoomAction(roomID));
}

function* write(socket: Socket) {
  yield takeEvery(SELECT_ROOM, selectRoom, socket);
  yield takeEvery(DESELECT_ROOM, deselectRoom, socket);
  yield takeEvery(SEND_MESSAGE, sendMessage, socket);
  yield takeEvery(LOAD_MORE, loadMore, socket);
  yield takeEvery(READ_MESSAGES, readMessages, socket);
  yield takeEvery(SEARCH, search, socket);
  yield takeEvery(SELECT_COMPANION, selectCompanion, socket);
  yield takeEvery(MESSAGE_PUSH, messagePush);
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
