import { useStore } from 'redux-manager';
import moment from 'moment';

const Header = () => {
  const roomID = useStore(state => state.messenger.chat.room);
  const rooms = useStore(state => state.messenger.rooms);

  if (!roomID) return null;
  else {
    const room = rooms?.find(room => room.uuid === roomID);
    if (!room) return null;
    const lastSeen = room.connected //
      ? 'online'
      : room.disconnected_at
      ? 'last seen ' + moment(room.disconnected_at).format('MM.DD.YYYY H:mm')
      : null;

    return roomID ? (
      <div className="p-1.5 text-center w-full bg-white">
        {room.name}
        {lastSeen && ` - ${lastSeen}`}
      </div>
    ) : null;
  }
};

export default Header;
