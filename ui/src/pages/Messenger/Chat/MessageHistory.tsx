import React from 'react';
import { CircularProgress } from '@mui/material';
import { positionValues, Scrollbars } from 'react-custom-scrollbars';
import { useInView } from 'react-intersection-observer';
import Message from './Message';
import { useStore, loadMore, readMessages } from 'redux-manager';
import { MESSAGES_LIMIT } from 'utils';
import moment from 'moment';
import { useWindowFocus } from 'hooks';

const MessageHistory = () => {
  const { loading, full, roomID } = useStore(state => state.messenger.chat);
  const room = useStore(state => state.messenger.rooms?.find(room => room.id === roomID));
  const companion = useStore(state => state.messenger.companions.find(s => s.uuid === room?.companion));
  const messages = room?.messages || [];
  const myUuid = useStore(state => state.auth.user?.uuid);
  const { ref, inView } = useInView();
  const windowFocused = useWindowFocus();

  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollbarRef = React.useRef<Scrollbars>(null);

  const scrollModeRef = React.useRef<boolean>(false);

  const onScroll = React.useCallback((values: positionValues) => {
    const { clientHeight, scrollHeight, scrollTop } = values;
    scrollModeRef.current = clientHeight + scrollTop < scrollHeight;
  }, []);

  const lastMessage: Message | undefined = messages[0];
  React.useEffect(() => {
    if (!scrollbarRef.current || (scrollModeRef.current && lastMessage?.from !== myUuid)) return;
    scrollbarRef.current.scrollToBottom();
  }, [myUuid, lastMessage, messages.length]);

  React.useEffect(() => {
    if (roomID && room?.initialized && windowFocused) readMessages();
  }, [roomID, room, messages.length, windowFocused]);

  React.useEffect(() => {
    if (!inView || full) return;
    loadMore();
  }, [inView, full]);

  const withMessageRef = Boolean(messages.length >= MESSAGES_LIMIT);
  let date: string | undefined = moment(lastMessage?.created_at).format('MMMM DD');
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
              const my = message.from === myUuid;
              const read = my && companion?.user_room.last_read ? message.created_at <= companion.user_room.last_read : undefined;
              return (
                <React.Fragment key={message.id}>
                  {Date}
                  <Message //
                    ref={withMessageRef && index === messages.length - 5 ? ref : undefined}
                    my={my}
                    read={read}
                    time={moment(message.created_at).format('HH:mm')}
                    container={containerRef.current}>
                    {message.text}
                  </Message>
                </React.Fragment>
              );
            })}
            {messages.length !== 0 && <p className="text-center text-sm py-1">{moment(messages[messages.length - 1].created_at).format('MMMM DD')}</p>}
          </div>
        </Scrollbars>
      )}
    </div>
  );
};

export default MessageHistory;
