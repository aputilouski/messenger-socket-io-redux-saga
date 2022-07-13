import React from 'react';
import { TextField, Button, Paper, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Link } from 'react-router-dom';
import { RegistrationCredentials, useStore, register, checkUsername } from 'redux-manager';
import { ValidateRegistrationCredentials } from 'utils/validation-scheme';

const Register = () => {
  const [state, setState] = React.useState<{ credentials: RegistrationCredentials; errors: Partial<RegistrationCredentials> }>({
    credentials: { name: '', username: '', password: '', confirmPassword: '' },
    errors: {},
  });

  const { loading, error, userAvailable } = useStore(state => state.auth);
  const userNotAvailable = userAvailable === false;

  const timerRef = React.useRef<NodeJS.Timeout>();
  const onChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement & { name: keyof RegistrationCredentials }>) => {
    const { name, value } = event.target;
    if (name === 'username' && value.trim()) {
      timerRef.current && clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => checkUsername(value), 800);
    }
    setState(state => {
      const credentials = { ...state.credentials, [name]: value };
      const errors = state.errors;
      if (errors[name]) delete errors[name];
      return { ...state, credentials };
    });
  }, []);

  const onSubmit = React.useCallback((event: React.FormEvent, credentials: RegistrationCredentials, userNotAvailable: boolean) => {
    event.preventDefault();
    if (userNotAvailable) return;
    const { errors } = ValidateRegistrationCredentials(credentials);
    if (errors) setState(state => ({ ...state, errors }));
    else register(credentials);
  }, []);

  return (
    <div className="w-screen h-screen flex">
      <form onSubmit={event => onSubmit(event, state.credentials, userNotAvailable)} className="max-w-sm w-full m-auto">
        <Paper className="flex flex-col gap-3.5 p-4" elevation={5}>
          <h1 className="text-2xl mb-1.5">Registration</h1>

          <TextField //
            value={state.credentials.username}
            onChange={onChange}
            name="username"
            label="Username"
            error={userNotAvailable || Boolean(state.errors.username)}
            helperText={userNotAvailable ? 'Username is already in use' : state.errors.username}
            color={userAvailable ? 'success' : undefined}
          />

          <TextField //
            value={state.credentials.name}
            onChange={onChange}
            name="name"
            label="Full Name"
            error={Boolean(state.errors.name)}
            helperText={state.errors.name}
          />

          <TextField //
            value={state.credentials.password}
            onChange={onChange}
            name="password"
            label="Password"
            type="password"
            autoComplete="off"
            error={Boolean(state.errors.password)}
            helperText={state.errors.password}
          />

          <TextField //
            value={state.credentials.confirmPassword}
            onChange={onChange}
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            autoComplete="off"
            error={Boolean(state.errors.confirmPassword)}
            helperText={state.errors.confirmPassword}
          />

          {error && <Alert severity="error">{error}</Alert>}

          <LoadingButton //
            loading={loading}
            variant="contained"
            size="large"
            type="submit">
            Register
          </LoadingButton>

          <Button //
            disabled={loading}
            variant="text"
            size="small"
            component={Link}
            to="/"
            replace>
            Login
          </Button>
        </Paper>
      </form>
    </div>
  );
};

export default Register;
