import { createSlice } from '@reduxjs/toolkit';
import { StoreAction } from '../actions';

type MessengerSlice = {
  rooms: User[] | undefined;
  chat: {
    loading: boolean;
    full: boolean;
    messages: Message[] | undefined;
    meta:
      | {
          room: User;
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
    setRooms: (state, action: StoreAction<User[]>) => ({ ...state, rooms: action.payload }),
    selectUser: (state, action: StoreAction<User>) => {
      state.chat.loading = true;
      state.chat.full = false;
      state.chat.meta = { room: action.payload };
    },
    setChat: (state, action: StoreAction<{ room: User; messages: Message[] }>) => {
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
