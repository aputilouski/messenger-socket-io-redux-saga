import { call, take, put, select, fork, all, cancel, cancelled, delay, takeEvery, takeLatest } from 'redux-saga/effects';
import { EventChannel, eventChannel, Task } from 'redux-saga';
import { io, Socket } from 'socket.io-client';
import { StoreAction, StoreActionPromise, SELECT_ROOM, DESELECT_ROOM, SEND_MESSAGE, LOAD_MORE, READ_MESSAGES, SEARCH, SELECT_CONTACT, MESSAGE_PUSH, selectRoom as selectRoomAction } from '../actions';
import authSlice from '../slices/auth';
import messengerSlice, { MessengerSlice } from '../slices/messenger';
import { RootState } from '../store';
import { notify, MESSAGES_LIMIT, shout } from 'utils';

function subscribe(socket: Socket) {
  return eventChannel(emit => {
    socket.off('connect_error');

    socket.on('initialization', (rooms: Room[], contacts: Contact[]) => {
      emit(messengerSlice.actions.init({ rooms, contacts }));
    });

    socket.on('user:connected', (uuid: string) => {
      emit(messengerSlice.actions.contactConnect({ uuid, connected: true }));
    });

    socket.on('user:disconnected', (uuid: string, disconnected_at) => {
      emit(messengerSlice.actions.contactConnect({ uuid, connected: false, disconnected_at }));
    });

    socket.on('messages', (roomID: number, messages: Message[]) => {
      emit(messengerSlice.actions.pushRoomMessages({ messages, roomID }));
    });

    socket.on('message:created', (roomID: number, message: Message) => {
      emit(messengerSlice.actions.pushRoomMessage({ roomID, message }));
      emit({ type: MESSAGE_PUSH, payload: { roomID, message } });
    });

    socket.on('messages:read', (uuid: string, last_read: any) => {
      emit(messengerSlice.actions.setContactLastRead({ uuid, last_read }));
    });

    socket.on('search', (result?: { rows: User[]; count: number }) => {
      if (result) emit(messengerSlice.actions.setSearchResult(result.rows));
      else emit(messengerSlice.actions.clearSearch());
    });

    socket.on('room:new', (room: Room, contact: Contact, autoSelect: boolean) => {
      emit(messengerSlice.actions.pushRoom({ room, contact: contact }));
      emit(messengerSlice.actions.clearSearch());
      if (autoSelect) emit(messengerSlice.actions.selectRoom({ roomID: room.id, loading: false }));
      socket.emit('subscribe', contact);
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
  if (!room.initialized) yield call([socket, socket.emit], 'messages', roomID, room.messages.length, MESSAGES_LIMIT);
}

function* deselectRoom(socket: Socket) {
  yield put(messengerSlice.actions.deselectRoom());
}

function* sendMessage(socket: Socket, action: StoreActionPromise<string>) {
  const { payload, resolve } = action;
  const { chat, search }: MessengerSlice = yield select(({ messenger }: RootState) => messenger);
  if (search?.userID) yield call([socket, socket.emit], 'room:new', search.userID, payload);
  else yield call([socket, socket.emit], 'message:create', { text: payload, room_id: chat.roomID });
  resolve();
}

function* loadMore(socket: Socket) {
  const messenger: MessengerSlice = yield select(({ messenger }: RootState) => messenger);
  const roomID = messenger.chat.roomID;
  const room = messenger.rooms?.find(room => room.id === roomID);
  if (!room) return;
  const offset = room.messages.length;
  yield call([socket, socket.emit], 'messages', roomID, offset, MESSAGES_LIMIT);
}

function* readMessages(socket: Socket) {
  const roomID: number = yield select(({ messenger }: RootState) => messenger.chat.roomID);
  yield call([socket, socket.emit], 'messages:read', roomID);
}

function* serverSearch(socket: Socket, text: string) {
  yield delay(800);
  yield call([socket, socket.emit], 'search', text);
}

function* search(socket: Socket, action: StoreAction<string>) {
  const text = action.payload;
  if (!text) yield put(messengerSlice.actions.clearSearch());
  else {
    yield fork(serverSearch, socket, text);
    const { rooms, contacts }: MessengerSlice = yield select(({ messenger }: RootState) => messenger);
    if (rooms) {
      const result: Room[] = rooms.filter(room => {
        const contact = contacts.find(user => user.uuid === room.contact);
        if (!contact) return false;
        const words = contact.name.split(' ').filter(w => Boolean(w));
        words.unshift(contact.username);
        words.push(contact.name);
        return words.some(w => w.startsWith(text));
      });
      yield put(messengerSlice.actions.setSearchRooms(result));
    }
  }
}

function* selectContact(socket: Socket, action: StoreAction<string>) {
  yield put(messengerSlice.actions.selectContact(action.payload));
}

function* messagePush(action: StoreAction<{ roomID: number; message: Message }>) {
  const { roomID, message } = action.payload;
  const messenger: MessengerSlice = yield select(({ messenger }: RootState) => messenger);
  if (roomID === messenger.chat.roomID) return;
  const room = messenger.rooms?.find(room => room.id === roomID);
  if (!room) return;
  const contact = messenger.contacts.find(c => c.uuid === room.contact);
  if (!contact) return;
  shout({ title: contact.name, text: message.text }, () => selectRoomAction(roomID));
}

function* write(socket: Socket) {
  yield takeEvery(SELECT_ROOM, selectRoom, socket);
  yield takeEvery(DESELECT_ROOM, deselectRoom, socket);
  yield takeEvery(SEND_MESSAGE, sendMessage, socket);
  yield takeEvery(LOAD_MORE, loadMore, socket);
  yield takeEvery(READ_MESSAGES, readMessages, socket);
  yield takeLatest(SEARCH, search, socket);
  yield takeEvery(SELECT_CONTACT, selectContact, socket);
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
