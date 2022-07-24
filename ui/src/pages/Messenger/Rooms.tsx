import { CircularProgress, TextField } from '@mui/material';
import RoomCard from './RoomCard';
import { selectRoom } from 'redux-manager';
import { useStore } from 'redux-manager';

const Rooms = () => {
  const rooms = useStore(state => state.messenger.rooms);
  const companions = useStore(state => state.messenger.companions);
  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
        <TextField
          label="Search"
          fullWidth
          size="small"
          // InputProps={{
          //   startAdornment: (
          //     <InputAdornment position="start">
          //       <AccountCircle />
          //     </InputAdornment>
          //   ),
          // }}
        />
      </div>
      <div className="grow p-2 flex flex-col gap-2.5">
        {rooms ? (
          rooms.map(room => {
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
          })
        ) : (
          <div className="h-full w-full flex justify-center items-center">
            <CircularProgress />
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
