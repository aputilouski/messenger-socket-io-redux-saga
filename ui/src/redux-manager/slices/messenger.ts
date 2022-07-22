import { createSlice } from '@reduxjs/toolkit';
import { StoreAction } from '../actions';

type MessengerSlice = {
  rooms: UserRoom[] | undefined;
  chat: {
    loading: boolean;
    full: boolean;
    messages: Message[] | undefined;
    room: string | undefined;
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
      room: undefined,
    },
  } as MessengerSlice,
  reducers: {
    setRooms: (state, action: StoreAction<UserRoom[]>) => {
      state.rooms = action.payload;
    },
    userConnect: (state, action: StoreAction<{ uuid: string; connected: boolean; disconnected_at?: string }>) => {
      const { uuid, connected, disconnected_at } = action.payload;
      const room = state.rooms?.find(room => room.uuid === uuid);
      if (room) {
        room.connected = connected;
        if (disconnected_at) room.disconnected_at = disconnected_at;
      }
    },
    selectRoom: (state, action: StoreAction<string>) => {
      state.chat.loading = true;
      state.chat.full = false;
      state.chat.room = action.payload;
    },
    setChat: (state, action: StoreAction<{ room: string; messages: Message[] }>) => {
      const { room, messages } = action.payload;
      state.chat.full = false;
      state.chat.room = room;
      state.chat.messages = Object.assign([], messages);
    },
    setChatMessages: function (state, action: StoreAction<{ messages: Message[]; full: boolean }>) {
      const { messages, full } = action.payload;
      state.chat.full = full;
      state.chat.loading = false;
      state.chat.messages = Object.assign([], messages);
    },
    pushChatMessage: (state, action: StoreAction<Message>) => {
      state.chat.messages = state.chat.messages ? [action.payload, ...state.chat.messages] : [action.payload];
    },
  },
});
