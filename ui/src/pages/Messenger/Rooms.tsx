import { TextField } from '@mui/material';
import RoomCard from './RoomCard';

const Rooms = () => {
  return (
    <>
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
      <div className="p-2 flex flex-col gap-2.5">
        <RoomCard />
        <RoomCard />
        <RoomCard />
        <RoomCard />
        <RoomCard />
      </div>
    </>
  );
};

export default Rooms;
