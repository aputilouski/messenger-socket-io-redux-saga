import { createSlice } from '@reduxjs/toolkit';
import { StoreAction } from '../actions';
import { MESSAGES_LIMIT } from 'utils';

export type MessengerSlice = {
  rooms: Room[] | undefined;
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
    chat: {
      loading: false,
      full: false,
      messages: undefined,
      roomID: undefined,
    },
  } as MessengerSlice,
  reducers: {
    setRooms: (state, action: StoreAction<Room[]>) => {
      state.rooms = action.payload;
    },
    userConnect: (state, action: StoreAction<{ uuid: string; connected: boolean; disconnected_at?: string }>) => {
      const { uuid, connected, disconnected_at } = action.payload;
      // const room = state.rooms?.find(room => room.uuid === uuid);
      // if (room) {
      //   room.connected = connected;
      //   if (disconnected_at) room.disconnected_at = disconnected_at;
      // }
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
