import { useStore } from 'redux-manager';
import { timestampFormat } from 'utils';

const Header = () => {
  const roomID = useStore(state => state.messenger.chat.roomID);
  const rooms = useStore(state => state.messenger.rooms);
  const companions = useStore(state => state.messenger.companions);
  if (!roomID) return null;
  else {
    const room = rooms?.find(room => room.id === roomID);
    if (!room) return null;
    const companion = companions.find(user => user.uuid === room.companion);
    if (!companion) return null;
    const lastSeen = companion.connected //
      ? 'online'
      : companion.disconnected_at
      ? 'last seen ' + timestampFormat(companion.disconnected_at)
      : null;

    return roomID ? (
      <div className="p-1.5 text-center w-full bg-white">
        {companion.name}
        {lastSeen && ` - ${lastSeen}`}
      </div>
    ) : null;
  }
};

export default Header;
