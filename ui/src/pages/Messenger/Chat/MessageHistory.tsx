import React from 'react';
import { CircularProgress } from '@mui/material';
import { Scrollbars } from 'react-custom-scrollbars';
import Message from './Message';
import { useStore } from 'redux-manager';

const MessageHistory = () => {
  const { loading, messages, meta } = useStore(state => state.messenger.chat);

  const loadedRef = React.useRef(false);
  React.useEffect(() => {
    loadedRef.current = !loading;
  }, [loading]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollbarRef = React.useRef<Scrollbars>(null);

  React.useEffect(() => {
    scrollbarRef.current?.scrollToBottom();
  }, [messages]);

  if (loading) return <CircularProgress className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />;
  else if (!messages) return <p className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">Select a chat to start messaging</p>;
  else
    return (
      <>
        {meta && <div className="p-1.5 text-center border-b-2 w-full absolute top-0 bg-white z-10">{meta.room.name} (last seen 15 min ago)</div>}
        <Scrollbars ref={scrollbarRef}>
          <div className="flex flex-col-reverse gap-2.5 p-3 pt-12 overflow-hidden" ref={containerRef}>
            {messages.map(message => (
              <Message //
                key={message.id}
                my={message.from === meta?.room.uuid}
                // read
                container={containerRef.current}
                appear={loadedRef.current}>
                {message.text}
              </Message>
            ))}
          </div>
        </Scrollbars>

        {/* <div className="flex flex-col-reverse gap-2.5 p-2 pt-12" ref={containerRef}>
          {messages.map(message => (
            <Message //
              key={message.id}
              my={message.from === meta?.room.uuid}
              // read
              container={containerRef.current}
              appear={loadedRef.current}>
              {message.text}
            </Message>
          ))}
        </div> */}
      </>
    );
};

export default MessageHistory;
