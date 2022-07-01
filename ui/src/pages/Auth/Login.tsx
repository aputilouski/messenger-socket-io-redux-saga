import { TextField, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="w-screen h-screen flex">
      <form className="max-w-sm w-full m-auto">
        <Paper className=" flex flex-col gap-2.5 p-3" elevation={5}>
          <h1 className="text-xl mb-1">Login</h1>
          <TextField //
            label="Username"
            autoComplete="username"
          />
          <TextField //
            label="Password"
            type="password"
            autoComplete="current-password"
          />

          <Button variant="contained">Login</Button>

          <Button variant="text" size="small" component={Link} to="/register">
            Register
          </Button>
        </Paper>
      </form>
    </div>
  );
};

export default Login;
