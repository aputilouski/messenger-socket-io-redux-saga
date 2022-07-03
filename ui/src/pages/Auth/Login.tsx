import React from 'react';
import { TextField, Paper, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Link } from 'react-router-dom';
import { login, RootState, LoginCredentials } from 'redux-manager';
import { useSelector } from 'react-redux';
// import { io } from 'socket.io-client';
// const socket = io();

const Login = () => {
  const [credentials, setCredentials] = React.useState<LoginCredentials>({ username: '', password: '' });
  const { loading } = useSelector((state: RootState) => state.auth);

  const onChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials(state => ({ ...state, [name]: value }));
  }, []);

  const onSubmit = React.useCallback((event: React.FormEvent, credentials: LoginCredentials) => {
    event.preventDefault();
    login(credentials);
  }, []);

  return (
    <div className="w-screen h-screen flex">
      <form onSubmit={event => onSubmit(event, credentials)} className="max-w-sm w-full m-auto">
        <Paper className=" flex flex-col gap-3.5 p-4" elevation={5}>
          <h1 className="text-2xl mb-1.5">Login</h1>
          <TextField //
            value={credentials.username}
            onChange={onChange}
            name="username"
            label="Username"
            autoComplete="username"
          />
          <TextField //
            value={credentials.password}
            onChange={onChange}
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
          />

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
