import Rooms from './Rooms';
import Chat from './Chat';
import Search from './Search';

const Messenger = () => (
  <div className="grid grid-cols-6 h-full divide-x-2">
    <div className="col-span-2">
      <div className="flex flex-col h-full">
        <div className="p-2">
          <Search />
        </div>
        <div className="grow p-2 flex flex-col gap-2.5">
          <Rooms />
        </div>
      </div>
    </div>
    <div className="col-span-4">
      <Chat />
    </div>
  </div>
);

export default Messenger;
