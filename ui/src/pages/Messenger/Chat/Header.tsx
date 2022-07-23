import { useStore } from 'redux-manager';
import moment from 'moment';

const Header = () => {
  const roomID = useStore(state => state.messenger.chat.roomID);
  const rooms = useStore(state => state.messenger.rooms);

  if (!roomID) return null;
  else {
    const room = rooms?.find(room => room.id === roomID);
    if (!room) return null;
    const user = room.users[0];
    if (!user) return null;
    const lastSeen = user.connected //
      ? 'online'
      : user.disconnected_at
      ? 'last seen ' + moment(user.disconnected_at).format('MM.DD.YYYY H:mm')
      : null;

    return roomID ? (
      <div className="p-1.5 text-center w-full bg-white">
        {user.name}
        {lastSeen && ` - ${lastSeen}`}
      </div>
    ) : null;
  }
};

export default Header;
