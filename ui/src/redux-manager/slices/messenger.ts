import { createSlice } from '@reduxjs/toolkit';
import { StoreAction } from '../actions';

type MessengerSlice = {
  rooms: User[] | undefined;
  chat: {
    loading: boolean;
    messages: Message[] | undefined;
    meta: any;
  };
};

export default createSlice({
  name: 'messenger',
  initialState: {
    rooms: undefined,
    chat: {
      loading: false,
      messages: undefined,
      meta: null,
    },
  } as MessengerSlice,
  reducers: {
    setRooms: (state, action: StoreAction<User[]>) => ({ ...state, rooms: action.payload }),
    runLoading: state => ({ ...state, chat: { ...state.chat, loading: true } }),
    setChatMessages: (state, action: StoreAction<Message[]>) => ({ ...state, chat: { ...state.chat, loading: false, messages: action.payload } }),
  },
});
