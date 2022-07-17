import { CircularProgress, TextField } from '@mui/material';
import RoomCard from './RoomCard';
import { selectUser } from 'redux-manager';
import { useStore } from 'redux-manager';

const Rooms = () => {
  const { rooms } = useStore(state => state.messenger);
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
          rooms.map(user => (
            <RoomCard //
              key={user.uuid}
              onClick={() => selectUser(user)}
              name={user.name}
            />
          ))
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
