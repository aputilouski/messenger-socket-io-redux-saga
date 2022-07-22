import React from 'react';
import { CircularProgress } from '@mui/material';
import { positionValues, Scrollbars } from 'react-custom-scrollbars';
import { useInView } from 'react-intersection-observer';
import Message from './Message';
import { useStore, loadMore } from 'redux-manager';
import { MESSAGES_LIMIT } from 'utils';
import moment from 'moment';

const MessageHistory = () => {
  const { loading, full, messages } = useStore(state => state.messenger.chat);
  const myUuid = useStore(state => state.auth.user?.uuid);
  const { ref, inView } = useInView();

  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollbarRef = React.useRef<Scrollbars>(null);

  const scrollModeRef = React.useRef<boolean>(false);

  const onScroll = React.useCallback((values: positionValues) => {
    const { clientHeight, scrollHeight, scrollTop } = values;
    scrollModeRef.current = clientHeight + scrollTop < scrollHeight;
  }, []);

  const firstMessage = messages && messages[0];
  React.useEffect(() => {
    if (!scrollbarRef.current || (scrollModeRef.current && firstMessage?.from !== myUuid)) return;
    scrollbarRef.current.scrollToBottom();
  }, [firstMessage, myUuid]);

  React.useEffect(() => {
    if (!inView || full) return;
    loadMore();
  }, [inView, full]);

  const withMessageRef = Boolean(messages && messages.length >= MESSAGES_LIMIT);
  let date: string | undefined = messages && moment(messages[0]?.created_at).format('MMMM DD');
  return (
    <div className="grow relative">
      {loading ? (
        <CircularProgress className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />
      ) : !messages ? (
        <p className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">Select a chat to start messaging</p>
      ) : (
        <Scrollbars ref={scrollbarRef} onUpdate={onScroll}>
          <div className="flex flex-col-reverse gap-2.5 p-3 pt-2 overflow-hidden" ref={containerRef}>
            {messages.map((message, index) => {
              const newDate = moment(message.created_at).format('MMMM DD');
              const showDate = newDate !== date;
              const Date = showDate ? <p className="text-center text-sm py-1">{date}</p> : null;
              date = newDate;
              return (
                <React.Fragment key={message.id}>
                  {Date}
                  <Message //
                    ref={withMessageRef && index === messages.length - 5 ? ref : undefined}
                    my={message.from === myUuid}
                    time={moment(message.created_at).format('HH:mm')}
                    // read
                    container={containerRef.current}>
                    {message.text}
                  </Message>
                </React.Fragment>
              );
            })}
          </div>
        </Scrollbars>
      )}
    </div>
  );
};

export default MessageHistory;
