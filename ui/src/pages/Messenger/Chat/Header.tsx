import { useStore } from 'redux-manager';
import moment from 'moment';

const Header = () => {
  const meta = useStore(state => state.messenger.chat.meta);

  const lastSeen = meta?.room.connected //
    ? 'online'
    : meta?.room.disconnected_at
    ? moment(meta.room.disconnected_at).format('MM.DD.YYYY H:mm')
    : null;

  return meta ? (
    <div className="p-1.5 text-center w-full bg-white">
      {meta.room.name}
      {lastSeen && ` - last seen ${lastSeen}`}
    </div>
  ) : null;
};

export default Header;
