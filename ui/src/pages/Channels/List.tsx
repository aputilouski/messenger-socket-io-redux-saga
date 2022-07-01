import { TextField } from '@mui/material';
import ChannelCard from './ChannelCard';

const List = () => {
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
        <ChannelCard />
        <ChannelCard />
        <ChannelCard />
        <ChannelCard />
        <ChannelCard />
      </div>
    </>
  );
};

export default List;
