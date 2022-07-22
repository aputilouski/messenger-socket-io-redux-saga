import { createSlice } from '@reduxjs/toolkit';
import { StoreAction } from '../actions';

type MessengerSlice = {
  rooms: UserRoom[] | undefined;
  chat: {
    loading: boolean;
    full: boolean;
    messages: Message[] | undefined;
    meta:
      | {
          room: UserRoom;
        }
      | undefined;
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
      meta: undefined,
    },
  } as MessengerSlice,
  reducers: {
    setRooms: (state, action: StoreAction<UserRoom[]>) => ({ ...state, rooms: action.payload }),
    userConnect: (state, action: StoreAction<{ uuid: string; connected: boolean }>) => {
      const { uuid, connected } = action.payload;
      const room = state.rooms?.find(room => room.uuid === uuid);
      if (room) room.connected = connected;
    },
    selectRoom: (state, action: StoreAction<UserRoom>) => {
      state.chat.loading = true;
      state.chat.full = false;
      state.chat.meta = { room: action.payload };
    },
    setChat: (state, action: StoreAction<{ room: UserRoom; messages: Message[] }>) => {
      state.chat.full = false;
      state.chat.meta = { room: action.payload.room };
      state.chat.messages = Object.assign([], action.payload.messages);
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
