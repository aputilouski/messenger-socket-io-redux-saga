import Header from './Header';
import MessageHistory from './MessageHistory';
import SendMessage from './SendMessage';

const Chat = () => (
  <div className="flex flex-col h-full divide-y-2">
    <Header />

    <MessageHistory />

    <SendMessage />
  </div>
);

export default Chat;
