import React from 'react';
import { TextField, Fab } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { sendMessage } from 'redux-manager';
import { useStore } from 'redux-manager';

const SendMessage = () => {
  const { meta } = useStore(state => state.messenger.chat);

  const textRef = React.useRef('');
  const textFieldRef = React.useRef<HTMLTextAreaElement>(null);

  const onChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    textRef.current = event.target.value;
  }, []);

  const onSubmit = React.useCallback(() => {
    const value = textRef.current;
    if (!value) return;
    sendMessage(value).then(() => {
      textRef.current = '';
      if (textFieldRef.current) textFieldRef.current.value = '';
    });
  }, []);

  const onPressEnter = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      onSubmit();
    },
    [onSubmit]
  );

  if (!meta) return null;
  return (
    <div className="flex gap-4 items-end">
      <TextField //
        inputRef={textFieldRef}
        onChange={onChange}
        label="Write a message..."
        fullWidth
        multiline
        maxRows={5}
        onKeyPress={onPressEnter}
      />

      <div className="p-1">
        <Fab //
          onClick={onSubmit}
          color="primary"
          size="medium">
          <SendIcon />
        </Fab>
      </div>
    </div>
  );
};

export default SendMessage;
