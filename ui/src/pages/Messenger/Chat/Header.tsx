import { useStore } from 'redux-manager';

const Header = () => {
  const meta = useStore(state => state.messenger.chat.meta);
  return meta ? <div className="p-1.5 text-center w-full bg-white">{meta.room.name} (last seen 15 min ago)</div> : null;
};

export default Header;
