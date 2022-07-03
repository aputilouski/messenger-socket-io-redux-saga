import React from 'react';
import { TextField, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';

const Login = () => {
  const [state, setState] = React.useState({ username: '', password: '' });

  const onChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setState(state => ({ ...state, [name]: value }));
  }, []);

  const onSubmit = (event: React.FormEvent, state: { username: string; password: string }) => {
    event.preventDefault();
    // console.log(state);
    // const socket = io('http://localhost:9002');
    // console.log(socket);
  };

  return (
    <div className="w-screen h-screen flex">
      <form onSubmit={event => onSubmit(event, state)} className="max-w-sm w-full m-auto">
        <Paper className=" flex flex-col gap-3.5 p-4" elevation={5}>
          <h1 className="text-2xl mb-1.5">Login</h1>
          <TextField //
            value={state.username}
            onChange={onChange}
            name="username"
            label="Username"
            autoComplete="username"
          />
          <TextField //
            value={state.password}
            onChange={onChange}
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
          />

          <Button variant="contained" size="large" type="submit">
            Login
          </Button>

          <Button variant="text" size="small" component={Link} to="/register">
            Register
          </Button>
        </Paper>
      </form>
    </div>
  );
};

export default Login;
