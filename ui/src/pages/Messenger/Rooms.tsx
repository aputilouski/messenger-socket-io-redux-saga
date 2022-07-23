import { CircularProgress, TextField } from '@mui/material';
import RoomCard from './RoomCard';
import { selectRoom } from 'redux-manager';
import { useStore } from 'redux-manager';

const Rooms = () => {
  const rooms = useStore(state => state.messenger.rooms);
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
            const user = room.users[0];
            if (!user) return null;
            return (
              <RoomCard //
                key={room.id}
                onClick={() => selectRoom(room.id)}
                name={user.name}
                connected={user.connected}
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
