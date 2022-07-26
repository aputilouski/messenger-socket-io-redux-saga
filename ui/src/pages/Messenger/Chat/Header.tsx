import { useStore } from 'redux-manager';
import { timestampFormat } from 'utils';

const Header = () => {
  const companion: Companion | undefined = useStore(state => {
    const companionID = state.messenger.search?.companionID;
    const roomID = state.messenger.chat.roomID;
    if (companionID) {
      const user = state.messenger.search?.result.find(c => c.uuid === companionID);
      return { ...user, connected: false, disconnected_at: undefined } as Companion;
    } else if (roomID) {
      const room = state.messenger.rooms?.find(room => room.id === roomID);
      if (!room) return;
      return state.messenger.companions.find(user => user.uuid === room.companion);
    }
  });
  if (!companion) return null;
  const lastSeen = companion.connected //
    ? 'online'
    : companion.disconnected_at
    ? 'last seen ' + timestampFormat(companion.disconnected_at)
    : null;
  return (
    <div className="p-1.5 text-center w-full bg-white">
      {companion.name}
      {lastSeen && ` - ${lastSeen}`}
    </div>
  );
};

export default Header;
