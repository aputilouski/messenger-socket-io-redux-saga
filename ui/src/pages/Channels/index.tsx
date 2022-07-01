import List from './List';
import Chat from './Chat';

const Channels = () => {
  return (
    <div className="grid grid-cols-6 h-full divide-x-2">
      <div className="col-span-2">
        <List />
      </div>
      <div className="col-span-4">
        <Chat />
      </div>
    </div>
  );
};

export default Channels;
