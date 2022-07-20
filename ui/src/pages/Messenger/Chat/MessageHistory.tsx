import React from 'react';
import { CircularProgress } from '@mui/material';
import { Scrollbars } from 'react-custom-scrollbars';
import { useInView } from 'react-intersection-observer';
import Message from './Message';
import { useStore, loadMore } from 'redux-manager';
import { MESSAGES_LIMIT } from 'utils';

const MessageHistory = () => {
  const { loading, full, messages } = useStore(state => state.messenger.chat);
  const myUuid = useStore(state => state.auth.user?.uuid);
  const { ref, inView } = useInView();

  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollbarRef = React.useRef<Scrollbars>(null);

  const firstMessage = messages?.find(m => m.from === myUuid);
  React.useEffect(() => {
    scrollbarRef.current?.scrollToBottom();
  }, [firstMessage]);

  React.useEffect(() => {
    if (!inView || full) return;
    loadMore();
  }, [inView, full]);

  const withMessageRef = Boolean(messages && messages.length >= MESSAGES_LIMIT);

  return (
    <div className="grow relative">
      {loading ? (
        <CircularProgress className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />
      ) : !messages ? (
        <p className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">Select a chat to start messaging</p>
      ) : (
        <Scrollbars ref={scrollbarRef}>
          <div className="flex flex-col-reverse gap-2.5 p-3 pt-2 overflow-hidden" ref={containerRef}>
            {messages.map((message, index) => (
              <Message //
                key={message.id}
                ref={withMessageRef && index === messages.length - 5 ? ref : undefined}
                my={message.from === myUuid}
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
