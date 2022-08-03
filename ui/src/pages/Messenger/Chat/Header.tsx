import { timestampFormat } from 'utils';
import { useChat } from './Provider';

const Header = () => {
  const { contact } = useChat();
  if (!contact) return null;
  const lastSeen = contact.connected //
    ? 'online'
    : contact.disconnected_at
    ? 'last seen ' + timestampFormat(contact.disconnected_at)
    : null;
  return (
    <div className="p-1.5 text-center w-full bg-white">
      {contact.name}
      {lastSeen && ` - ${lastSeen}`}
    </div>
  );
};

export default Header;
