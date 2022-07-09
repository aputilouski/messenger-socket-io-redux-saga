import { Avatar, Button, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { logout, RootState } from 'redux-manager';
import { useSelector } from 'react-redux';

const Header = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <div className="py-2 px-5 grid grid-cols-6 items-center">
      <div className="col-span-2 flex items-center">
        <IconButton size="large">
          <SettingsIcon />
        </IconButton>
        <div className="flex items-center gap-3 mx-2.5">
          <Avatar sx={{ width: 48, height: 48 }}>{user?.name[0]}</Avatar>
          <p className="text-lg">{user?.name}</p>
        </div>
      </div>
      <div className="col-span-4 text-right">
        <Button variant="contained" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Header;
