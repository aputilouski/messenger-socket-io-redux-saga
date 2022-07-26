import { CircularProgress } from '@mui/material';
import RoomCard from './RoomCard';
import { selectRoom, selectCompanion } from 'redux-manager';
import { useStore } from 'redux-manager';

const Rooms = () => {
  const rooms = useStore(state => state.messenger.rooms);
  const companions = useStore(state => state.messenger.companions);
  const search = useStore(state => state.messenger.search);
  return rooms ? (
    <>
      {(search?.rooms || rooms).map(room => {
        const companion = companions.find(user => user.uuid === room.companion);
        if (!companion) return null;
        return (
          <RoomCard //
            key={room.id}
            onClick={() => selectRoom(room.id)}
            name={companion.name}
            connected={companion.connected}
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
              onClick={() => selectCompanion(user.uuid)}
              name={user.name}
              username={user.username}
            />
          ))}
        </>
      )}
    </>
  ) : (
    <div className="h-full w-full flex justify-center items-center">
      <CircularProgress />
    </div>
  );
};

export default Rooms;
