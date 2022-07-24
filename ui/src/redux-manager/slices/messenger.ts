import { createSlice } from '@reduxjs/toolkit';
import { StoreAction } from '../actions';
import { MESSAGES_LIMIT } from 'utils';

export type MessengerSlice = {
  rooms: Room[] | undefined;
  companions: Companion[];
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
    companions: [],
    chat: {
      loading: false,
      full: false,
      roomID: undefined,
    },
  } as MessengerSlice,
  reducers: {
    init: (state, action: StoreAction<{ rooms: Room[]; companions: Companion[] }>) => {
      const { rooms, companions } = action.payload;
      state.rooms = rooms;
      state.companions = companions;
    },
    quit: state => {
      state.rooms = undefined;
      state.companions = [];
      state.chat = {
        loading: false,
        full: false,
        roomID: undefined,
      };
    },
    companionConnect: (state, action: StoreAction<{ uuid: string; connected: boolean; disconnected_at?: string }>) => {
      const { uuid, connected, disconnected_at } = action.payload;
      const user = state.companions.find(user => user.uuid === uuid);
      if (user) {
        user.connected = connected;
        if (disconnected_at) user.disconnected_at = disconnected_at;
      }
    },
    setCompanionLastRead: (state, action: StoreAction<{ uuid: string; last_read: string }>) => {
      const { uuid, last_read } = action.payload;
      const companion = state.companions.find(c => c.uuid === uuid);
      if (companion) companion.user_room.last_read = last_read;
    },
    selectRoom: (state, action: StoreAction<{ roomID: number; loading: boolean }>) => {
      const { roomID, loading } = action.payload;
      state.chat.full = false;
      state.chat.loading = loading;
      state.chat.roomID = roomID;
    },
    setRoomUnreadCount: (state, action: StoreAction<{ roomID: number; count?: number }>) => {
      const { roomID, count = 0 } = action.payload;
      const room = state.rooms?.find(room => room.id === roomID);
      if (room) room.unread_count = count;
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
      if (room) {
        room.messages = [message, ...room.messages];
        if (room.id !== state.chat.roomID) room.unread_count++;
      }
    },
  },
});
