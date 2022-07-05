import React from 'react';
import { TextField, Paper, Button, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Link } from 'react-router-dom';
import { login, RootState, LoginCredentials } from 'redux-manager';
import { useSelector } from 'react-redux';
import Joi from 'joi';
// import { io } from 'socket.io-client';
// const socket = io();

const LoginCredentialsScheme = Joi.object<LoginCredentials>({
  username: Joi.string().alphanum().min(3).max(30).required().label('Username'),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).label('Password'),
});

const Login = () => {
  const [state, setState] = React.useState<{ credentials: LoginCredentials; errors: Partial<LoginCredentials> }>({
    credentials: { username: '', password: '' },
    errors: {},
  });

  const { loading, error } = useSelector((state: RootState) => state.auth);

  const onChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement & { name: keyof LoginCredentials }>) => {
    const { name, value } = event.target;
    setState(state => {
      const credentials = { ...state.credentials, [name]: value };
      const errors = state.errors;
      if (errors[name]) delete errors[name];
      return { ...state, credentials };
    });
  }, []);

  const onSubmit = React.useCallback((event: React.FormEvent, credentials: LoginCredentials) => {
    event.preventDefault();
    const { error } = LoginCredentialsScheme.validate(credentials, { abortEarly: false });
    if (error?.details.length) {
      const errors: Partial<LoginCredentials> = {};
      (Object.keys(credentials) as (keyof LoginCredentials)[]).forEach(key => {
        const details = error.details.find(e => e.path.includes(key));
        if (details) errors[key] = details.message;
      });
      setState(state => ({ ...state, errors }));
    } else login(credentials);
  }, []);

  return (
    <div className="w-screen h-screen flex">
      <form onSubmit={event => onSubmit(event, state.credentials)} className="max-w-sm w-full m-auto">
        <Paper className=" flex flex-col gap-3.5 p-4" elevation={5}>
          <h1 className="text-2xl mb-1.5">Login</h1>
          <TextField //
            value={state.credentials.username}
            onChange={onChange}
            name="username"
            label="Username"
            autoComplete="username"
            error={Boolean(state.errors.username)}
            helperText={state.errors.username}
          />
          <TextField //
            value={state.credentials.password}
            onChange={onChange}
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            error={Boolean(state.errors.password)}
            helperText={state.errors.password}
          />

          {error && <Alert severity="error">{error}</Alert>}

          <LoadingButton //
            loading={loading}
            variant="contained"
            size="large"
            type="submit">
            Login
          </LoadingButton>

          <Button //
            variant="text"
            size="small"
            component={Link}
            to="/register">
            Register
          </Button>
        </Paper>
      </form>
    </div>
  );
};

export default Login;
