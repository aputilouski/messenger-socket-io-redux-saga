import { call, take, put, select, fork, all, cancel, cancelled, takeEvery } from 'redux-saga/effects';
import { EventChannel, eventChannel, Task } from 'redux-saga';
import { io, Socket } from 'socket.io-client';
import { StoreAction, StoreActionPromise, SELECT_ROOM, SEND_MESSAGE, LOAD_MORE } from '../actions';
import authSlice from '../slices/auth';
import messengerSlice from '../slices/messenger';
import { RootState } from '../store';
import { notify, MESSAGES_LIMIT } from 'utils';

const messageMap = new Map<string, Message[]>();
const messageStore = {
  getMessages: messageMap.get.bind(messageMap),
  setMessages: messageMap.set.bind(messageMap),
  pushMessage: (uuid: string, message: Message) => {
    const messages = messageMap.get(uuid);
    if (messages) messages.unshift(message);
    else messageMap.set(uuid, [message]);
  },
};

function subscribe(socket: Socket) {
  return eventChannel(emit => {
    socket.off('connect_error');

    socket.on('rooms', (rooms: UserRoom[]) => {
      emit(messengerSlice.actions.setRooms(rooms));
    });

    socket.on('user:connected', (uuid: string) => {
      emit(messengerSlice.actions.userConnect({ uuid, connected: true }));
    });

    socket.on('user:disconnected', (uuid: string, disconnected_at) => {
      emit(messengerSlice.actions.userConnect({ uuid, connected: false, disconnected_at }));
    });

    socket.on('messages', (uuid: string, messages: Message[]) => {
      const _messages = messageStore.getMessages(uuid) || [];
      const all = _messages.concat(messages);
      messageStore.setMessages(uuid, all);
      emit(messengerSlice.actions.setChatMessages({ messages: all, full: _messages.length === MESSAGES_LIMIT }));
    });

    socket.on('message:created', (uuid: string, message: Message) => {
      messageStore.pushMessage(uuid, message);
      emit(messengerSlice.actions.pushChatMessage(message));
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

function* selectRoom(socket: Socket, action: StoreAction<UserRoom>) {
  const room: string | undefined = yield select(({ messenger }: RootState) => messenger.chat.room);
  if (room === action.payload.uuid) return;
  const messages = messageStore.getMessages(action.payload.uuid);
  if (!messages) {
    yield put(messengerSlice.actions.selectRoom(action.payload.uuid));
    socket.emit('messages', action.payload.uuid, 0, MESSAGES_LIMIT);
  } else {
    yield put(messengerSlice.actions.setChat({ messages, room: action.payload.uuid }));
  }
}

function* sendMessage(socket: Socket, action: StoreActionPromise<string>) {
  const { payload, resolve } = action;
  const room: string = yield select(({ messenger }: RootState) => messenger.chat.room);
  socket.emit('message:create', { text: payload, to: room });
  resolve();
}

function* loadMore(socket: Socket) {
  const room: string = yield select(({ messenger }: RootState) => messenger.chat.room);
  const messageOffset = messageStore.getMessages(room)?.length;
  socket.emit('messages', room, messageOffset, MESSAGES_LIMIT);
}

function* write(socket: Socket) {
  yield takeEvery(SELECT_ROOM, selectRoom, socket);
  yield takeEvery(SEND_MESSAGE, sendMessage, socket);
  yield takeEvery(LOAD_MORE, loadMore, socket);
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
