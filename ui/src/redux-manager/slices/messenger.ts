import { createSlice } from '@reduxjs/toolkit';
import { StoreAction } from '../actions';

type MessengerSlice = {
  rooms: User[] | undefined;
  chat: {
    loading: boolean;
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
      messages: undefined,
      meta: undefined,
    },
  } as MessengerSlice,
  reducers: {
    setRooms: (state, action: StoreAction<User[]>) => ({ ...state, rooms: action.payload }),
    selectUser: (state, action: StoreAction<User>) => ({ ...state, chat: { ...state.chat, loading: true, meta: { room: action.payload } } }),
    setChatMessages: (state, action: StoreAction<Message[]>) => ({ ...state, chat: { ...state.chat, loading: false, messages: action.payload } }),
    pushMessage: (state, action: StoreAction<Message>) => {
      const messages: Message[] = state.chat.messages ? [...state.chat.messages, action.payload] : [action.payload];
      return { ...state, chat: { ...state.chat, messages } };
    },
  },
});
