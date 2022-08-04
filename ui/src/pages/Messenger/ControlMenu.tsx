import React from 'react';
import { Avatar, Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, Alert } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useStore, logout, checkUsername, updateUser, Userdata } from 'redux-manager';
import { LoadingButton } from '@mui/lab';
import { ValidateProfile } from 'utils/validation-scheme';

const Header = () => {
  const { user } = useStore(state => state.auth);
  const [open, setOpen] = React.useState<boolean>(false);
  const [userdata, setUserdata] = React.useState<Userdata>({ name: '', username: '' });
  const [errors, setErrors] = React.useState<Partial<Userdata>>({});

  const [loading, setLoading] = React.useState(false);
  const [responseError, setResponseError] = React.useState<string>();

  const [usernameAvailable, setUsernameAvailable] = React.useState<boolean>();

  React.useEffect(() => {
    if (!user || open) return;
    const { name, username } = user;
    setUserdata({ name, username });
    setUsernameAvailable(true);
    setResponseError(undefined);
  }, [user, open]);

  const onChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement & { name: keyof Userdata }>) => {
    const { name, value } = event.target;
    if (name === 'username' && value.trim()) checkUsername(value).then(setUsernameAvailable);
    setUserdata(data => ({ ...data, [name]: value }));
    setErrors(errors => {
      if (errors[name]) {
        delete errors[name];
        return { ...errors };
      } else return errors;
    });
  }, []);

  const onSubmit = React.useCallback((event: React.FormEvent, userdata: Userdata, userNotAvailable: boolean) => {
    event.preventDefault();
    if (userNotAvailable) return;
    const { errors } = ValidateProfile(userdata);
    if (errors) setErrors(errors);
    else {
      setResponseError(undefined);
      setLoading(true);
      updateUser(userdata)
        .then(() => setOpen(false))
        .catch(error => setResponseError(error))
        .finally(() => setLoading(false));
    }
  }, []);

  const userNotAvailable = usernameAvailable === false && user?.username !== userdata.username;

  return (
    <>
      <div className="py-2 px-5 grid grid-cols-6 items-center">
        <div className="col-span-2 flex items-center">
          <IconButton size="large" onClick={() => setOpen(true)}>
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

      <Dialog //
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
        keepMounted>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <form //
            onSubmit={event => onSubmit(event, userdata, userNotAvailable)}
            className="flex flex-col gap-3 py-2.5">
            <TextField //
              value={userdata.name}
              onChange={onChange}
              name="name"
              label="Name"
              error={Boolean(errors.name)}
              helperText={errors.name}
            />

            <TextField //
              value={userdata.username}
              onChange={onChange}
              name="username"
              label="Username"
              error={userNotAvailable || Boolean(errors.username)}
              helperText={userNotAvailable ? 'Username is already in use' : errors.username}
              color={usernameAvailable ? 'success' : undefined}
            />

            {responseError && <Alert severity="error">{responseError}</Alert>}

            <LoadingButton //
              type="submit"
              loading={loading}
              disabled={userNotAvailable}
              variant="contained"
              size="large">
              Save
            </LoadingButton>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
