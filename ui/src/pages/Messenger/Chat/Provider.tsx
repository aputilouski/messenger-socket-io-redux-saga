import React from 'react';
import { useStore } from 'redux-manager';

const ChatProvider = React.createContext<{
  roomID: number | undefined;
  contactID: string | undefined;
  room: Room | undefined;
  contact: Contact | undefined;
}>({
  roomID: undefined,
  contactID: undefined,
  room: undefined,
  contact: undefined,
});

export const ProvideChat = ({ children }: { children: JSX.Element }) => {
  const { roomID } = useStore(state => state.messenger.chat);
  const room = useStore(state => state.messenger.rooms?.find(room => room.id === roomID));
  const contactID = useStore(state => state.messenger.search?.userID);
  const contact: Contact | undefined = useStore(state => {
    if (contactID) {
      const user = state.messenger.search?.result?.find(c => c.uuid === contactID);
      if (!user) return;
      return { ...user, connected: false, disconnected_at: undefined, user_room: { last_read: null } };
    } else if (room) {
      return state.messenger.contacts.find(user => user.uuid === room.contact);
    }
  });

  const chat = { roomID, contactID, room, contact };

  return <ChatProvider.Provider value={chat}>{children}</ChatProvider.Provider>;
};

export const useChat = () => React.useContext(ChatProvider);
