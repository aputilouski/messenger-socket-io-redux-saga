import Header from './Header';
import MessageHistory from './MessageHistory';
import SendMessage from './SendMessage';
import { ProvideChat } from './Provider';

const Chat = () => (
  <ProvideChat>
    <div className="flex flex-col h-full divide-y-2">
      <Header />
      <MessageHistory />
      <SendMessage />
    </div>
  </ProvideChat>
);

export default Chat;
