import { TextField } from '@mui/material';
// import { Send as SendIcon } from '@mui/icons-material';

const SendMessage = () => {
  return (
    <div className="flex gap-4 items-end">
      <TextField //
        label="Write a message..."
        fullWidth
        multiline
        maxRows={5}
      />
      {/* <IconButton color="primary">
        <SendIcon />
      </IconButton> */}
    </div>
  );
};

export default SendMessage;
