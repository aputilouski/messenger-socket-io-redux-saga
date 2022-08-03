import React from 'react';
import { CircularProgress } from '@mui/material';
import RoomCard from './RoomCard';
import { selectRoom, selectContact, deselectRoom, useStore } from 'redux-manager';
import { Scrollbars } from 'react-custom-scrollbars';

const Rooms = () => {
  const rooms = useStore(state => state.messenger.rooms);
  const contacts = useStore(state => state.messenger.contacts);
  const search = useStore(state => state.messenger.search);

  React.useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) deselectRoom();
    };
    document.addEventListener('keydown', listener, false);
    return () => document.removeEventListener('keydown', listener);
  }, []);

  return rooms ? (
    <>
      <Scrollbars>
        <div className="p-2 flex flex-col gap-2.5">
          {(search?.rooms || rooms).map(room => {
            const contact = contacts.find(user => user.uuid === room.contact);
            if (!contact) return null;
            return (
              <RoomCard //
                key={room.id}
                onClick={() => selectRoom(room.id)}
                name={contact.name}
                connected={contact.connected}
                lastMessage={room.messages[0]}
                unreadCount={room.unread_count}
              />
            );
          })}
          {search && (
            <>
              <p className="mt-3 text-xs text-gray-600 text-center">Global Search</p>
              {search.result.length === 0 && <p className="mt-3 text-sm text-center">No results</p>}
              {search.result.map(user => (
                <RoomCard //
                  key={user.uuid}
                  onClick={() => selectContact(user.uuid)}
                  name={user.name}
                  username={user.username}
                />
              ))}
            </>
          )}
        </div>
      </Scrollbars>
    </>
  ) : (
    <div className="h-full w-full flex justify-center items-center">
      <CircularProgress />
    </div>
  );
};

export default Rooms;
