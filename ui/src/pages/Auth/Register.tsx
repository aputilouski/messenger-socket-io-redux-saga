import { TextField, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="w-screen h-screen flex">
      <form className="max-w-sm w-full m-auto">
        <Paper className=" flex flex-col gap-2.5 p-3" elevation={5}>
          <h1 className="text-xl mb-1">Registration</h1>
          <TextField //
            label="Username"
            autoComplete="username"
          />
          <TextField //
            label="Password"
            type="password"
            autoComplete="current-password"
          />
          <TextField //
            label="Confirm Password"
            type="password"
            autoComplete="current-password"
          />

          <Button variant="contained">Register</Button>

          <Button variant="text" size="small" component={Link} to="/">
            Login
          </Button>
        </Paper>
      </form>
    </div>
  );
};

export default Register;
