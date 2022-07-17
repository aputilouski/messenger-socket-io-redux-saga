import { CircularProgress } from '@mui/material';
import React from 'react';
import Message from './Message';
import { useStore } from 'redux-manager';

const MessageHistory = () => {
  const { loading, messages } = useStore(state => state.messenger.chat);

  const mountedRef = React.useRef(false);
  React.useEffect(() => {
    mountedRef.current = true;
  }, []);

  const containerRef = React.useRef(null);

  if (loading) return <CircularProgress className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />;
  else if (!messages) return <p className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">Select a chat to start messaging</p>;
  else
    return (
      <>
        <div className="p-1.5 text-center border-b-2 absolute w-full">Selected User (last seen 15 min ago)</div>

        <div className="flex flex-col gap-2.5 overflow-hidden h-full p-2 pt-12" ref={containerRef}>
          <Message //
            my
            read
            container={containerRef.current}
            appear={mountedRef.current}>
            Some message text
          </Message>

          <Message //
            read
            container={containerRef.current}
            appear={mountedRef.current}>
            Some message text
          </Message>

          <Message //
            my
            container={containerRef.current}
            appear={mountedRef.current}>
            Some message text Some message text Some message text Some message text Some message text
          </Message>

          <Message //
            container={containerRef.current}
            appear={mountedRef.current}>
            Some message text
          </Message>
        </div>
      </>
    );
};
export default MessageHistory;
