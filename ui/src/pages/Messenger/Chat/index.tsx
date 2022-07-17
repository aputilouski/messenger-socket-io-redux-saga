import MessageHistory from './MessageHistory';
import SendMessage from './SendMessage';

const Chat = () => (
  <div className="flex flex-col h-full divide-y-2">
    <div className="grow relative">
      <MessageHistory />
    </div>
    <div className="p-2">
      <SendMessage />
    </div>
  </div>
);

export default Chat;
