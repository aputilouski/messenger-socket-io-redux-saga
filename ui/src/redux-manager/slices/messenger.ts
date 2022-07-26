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
  search:
    | {
        companionID: string | undefined;
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
    companions: [],
    chat: {
      loading: false,
      full: false,
      roomID: undefined,
    },
    search: undefined,
  } as MessengerSlice,
  reducers: {
    init: (state, action: StoreAction<{ rooms: Room[]; companions: Companion[] }>) => {
      const { rooms, companions } = action.payload;
      sortRooms(rooms);
      state.rooms = rooms;
      state.companions = companions;
    },
    pushRoom: (state, action: StoreAction<{ room: Room; companion: Companion }>) => {
      const { room, companion } = action.payload;
      room.initialized = true;
      state.rooms = state.rooms ? [room, ...state.rooms] : [room];
      state.companions = [companion, ...state.companions];
    },
    quit: state => {
      state.rooms = undefined;
      state.companions = [];
      state.chat = {
        loading: false,
        full: false,
        roomID: undefined,
      };
      state.search = undefined;
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
      if (state.search) state.search.companionID = undefined;
    },
    dropRoom: state => {
      state.chat = {
        loading: false,
        full: false,
        roomID: undefined,
      };
      if (state.search) state.search.companionID = undefined;
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
        companionID: undefined,
        result: action.payload,
        rooms: state.search?.rooms || [],
      };
    },
    setSearchRooms: (state, action: StoreAction<Room[]>) => {
      state.search = {
        companionID: state.search?.companionID,
        result: state.search?.result || [],
        rooms: action.payload,
      };
    },
    clearSearch: state => {
      state.search = undefined;
    },
    selectCompanion: (state, action: StoreAction<string>) => {
      state.chat.roomID = undefined;
      if (state.search) state.search.companionID = action.payload;
    },
  },
});
