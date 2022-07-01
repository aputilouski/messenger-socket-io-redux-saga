import History from './History';
import SendMessage from './SendMessage';

const Chat = () => {
  return (
    <div className="flex flex-col h-full divide-y-2">
      <div className="grow">
        <History />
      </div>
      <div className="p-2">
        <SendMessage />
      </div>
    </div>
  );
};

export default Chat;
