import Rooms from './Rooms';
import Chat from './Chat';

const Messenger = () => {
  return (
    <div className="grid grid-cols-6 h-full divide-x-2">
      <div className="col-span-2">
        <Rooms />
      </div>
      <div className="col-span-4">
        <Chat />
      </div>
    </div>
  );
};

export default Messenger;
