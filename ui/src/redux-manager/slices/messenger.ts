import { createSlice } from '@reduxjs/toolkit';
import { StoreAction } from '../actions';
import { MESSAGES_LIMIT } from 'utils';

export type MessengerSlice = {
  rooms: Room[] | undefined;
  contacts: Contact[];
  chat: {
    loading: boolean;
    full: boolean;
    roomID: number | undefined;
  };
  search:
    | {
        userID: string | undefined;
        result: User[];
        rooms: Room[];
      }
    | undefined;
};

// sort by latest message (newest first)
const sortRooms = (rooms: Room[] | undefined) => {
  if (!rooms) return;
  rooms.sort((a, b) => {
    const messageA = a.messages[0].created_at;
    const messageB = b.messages[0].created_at;
    if ((!messageA && !messageB) || messageA === messageB) return 0;
    else if (!messageA || !messageB) return messageA ? -1 : 1;
    else return messageA > messageB ? -1 : 1;
  });
};

export default createSlice({
  name: 'messenger',
  initialState: {
    rooms: undefined,
    contacts: [],
    chat: {
      loading: false,
      full: false,
      roomID: undefined,
    },
    search: undefined,
  } as MessengerSlice,
  reducers: {
    init: (state, action: StoreAction<{ rooms: Room[]; contacts: Contact[] }>) => {
      const { rooms, contacts } = action.payload;
      sortRooms(rooms);
      state.rooms = rooms;
      state.contacts = contacts;
    },
    pushRoom: (state, action: StoreAction<{ room: Room; contact: Contact }>) => {
      const { room, contact } = action.payload;
      room.initialized = true;
      state.rooms = state.rooms ? [room, ...state.rooms] : [room];
      state.contacts = [contact, ...state.contacts];
    },
    quit: state => {
      state.rooms = undefined;
      state.contacts = [];
      state.chat = {
        loading: false,
        full: false,
        roomID: undefined,
      };
      state.search = undefined;
    },
    contactConnect: (state, action: StoreAction<{ uuid: string; connected: boolean; disconnected_at?: string }>) => {
      const { uuid, connected, disconnected_at } = action.payload;
      const user = state.contacts.find(user => user.uuid === uuid);
      if (user) {
        user.connected = connected;
        if (disconnected_at) user.disconnected_at = disconnected_at;
      }
    },
    setContactLastRead: (state, action: StoreAction<{ uuid: string; last_read: string }>) => {
      const { uuid, last_read } = action.payload;
      const contact = state.contacts.find(c => c.uuid === uuid);
      if (contact) contact.user_room.last_read = last_read;
    },
    selectRoom: (state, action: StoreAction<{ roomID: number; loading: boolean }>) => {
      const { roomID, loading } = action.payload;
      state.chat.full = false;
      state.chat.loading = loading;
      state.chat.roomID = roomID;
      if (state.search) state.search.userID = undefined;
    },
    deselectRoom: state => {
      state.chat = {
        loading: false,
        full: false,
        roomID: undefined,
      };
      if (state.search) state.search.userID = undefined;
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
        sortRooms(state.rooms);
      }
    },
    setSearchResult: (state, action: StoreAction<User[]>) => {
      state.search = {
        userID: undefined,
        result: action.payload,
        rooms: state.search?.rooms || [],
      };
    },
    setSearchRooms: (state, action: StoreAction<Room[]>) => {
      state.search = {
        userID: state.search?.userID,
        result: state.search?.result || [],
        rooms: action.payload,
      };
    },
    clearSearch: state => {
      state.search = undefined;
    },
    selectContact: (state, action: StoreAction<string>) => {
      state.chat.roomID = undefined;
      if (state.search) state.search.userID = action.payload;
    },
  },
});
