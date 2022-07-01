import React from 'react';
import Message from './Message';

const History = () => {
  const mountedRef = React.useRef(false);
  React.useEffect(() => {
    mountedRef.current = true;
  }, []);

  const containerRef = React.useRef(null);

  return (
    <>
      <div className="p-1.5 text-center text-lg border-b-2">Selected User</div>
      <div className="flex flex-col gap-2.5 overflow-hidden h-full p-2" ref={containerRef}>
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
export default History;
