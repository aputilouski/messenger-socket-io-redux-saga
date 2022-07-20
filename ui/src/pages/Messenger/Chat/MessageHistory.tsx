import React from 'react';
import { CircularProgress } from '@mui/material';
import { Scrollbars } from 'react-custom-scrollbars';
import Message from './Message';
import { useStore } from 'redux-manager';

const MessageHistory = () => {
  const { loading, messages, meta } = useStore(state => state.messenger.chat);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollbarRef = React.useRef<Scrollbars>(null);

  React.useEffect(() => {
    scrollbarRef.current?.scrollToBottom();
  }, [messages]);

  return (
    <div className="grow relative">
      {loading ? (
        <CircularProgress className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />
      ) : !messages ? (
        <p className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">Select a chat to start messaging</p>
      ) : (
        <Scrollbars ref={scrollbarRef}>
          <div className="flex flex-col-reverse gap-2.5 p-3 pt-12 overflow-hidden" ref={containerRef}>
            {messages.map(message => (
              <Message //
                key={message.id}
                my={message.from === meta?.room.uuid}
                // read
                container={containerRef.current}>
                {message.text}
              </Message>
            ))}
          </div>
        </Scrollbars>
      )}
    </div>
  );
};

export default MessageHistory;
