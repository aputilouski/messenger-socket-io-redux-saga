import { createSlice } from '@reduxjs/toolkit';
import { StoreAction } from '../actions';
import { MESSAGES_LIMIT } from 'utils';

export type MessengerSlice = {
  rooms: Room[] | undefined;
  subscribers: User[];
  chat: {
    loading: boolean;
    full: boolean;
    roomID: number | undefined;
  };
};

export default createSlice({
  name: 'messenger',
  initialState: {
    rooms: undefined,
    subscribers: [],
    chat: {
      loading: false,
      full: false,
      roomID: undefined,
    },
  } as MessengerSlice,
  reducers: {
    init: (state, action: StoreAction<{ rooms: Room[]; subscribers: User[] }>) => {
      const { rooms, subscribers } = action.payload;
      state.rooms = rooms;
      state.subscribers = subscribers;
    },
    quit: state => {
      state.rooms = undefined;
      state.subscribers = [];
      state.chat = {
        loading: false,
        full: false,
        roomID: undefined,
      };
    },
    subscriberConnect: (state, action: StoreAction<{ uuid: string; connected: boolean; disconnected_at?: string }>) => {
      const { uuid, connected, disconnected_at } = action.payload;
      const user = state.subscribers.find(user => user.uuid === uuid);
      if (user) {
        user.connected = connected;
        if (disconnected_at) user.disconnected_at = disconnected_at;
      }
    },
    selectRoom: (state, action: StoreAction<number>) => {
      state.chat.loading = true;
      state.chat.full = false;
      state.chat.roomID = action.payload;
    },
    pushRoomMessages: function (state, action: StoreAction<{ roomID: number; messages: Message[] }>) {
      const { roomID, messages } = action.payload;
      state.chat.full = messages.length !== MESSAGES_LIMIT;
      state.chat.loading = false;
      const room = state.rooms?.find(room => room.id === roomID);
      if (room) {
        room.initialized = true;
        room.messages = room.messages.concat(messages);
      }
    },
    pushRoomMessage: (state, action: StoreAction<{ roomID: number; message: Message }>) => {
      const { roomID, message } = action.payload;
      const room = state.rooms?.find(room => room.id === roomID);
      if (room) room.messages = [message, ...room.messages];
    },
  },
});
