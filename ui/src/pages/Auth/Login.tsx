import React from 'react';
import { TextField, Paper, Button, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Link } from 'react-router-dom';
import { login, LoginCredentials } from 'redux-manager';
import { ValidateLoginCredentials } from 'utils/validation-scheme';

const Login = () => {
  const [credentials, setCredentials] = React.useState<LoginCredentials>({ username: '', password: '' });
  const [errors, setErrors] = React.useState<Partial<LoginCredentials>>({});

  const [loading, setLoading] = React.useState(false);
  const [responseError, setResponseError] = React.useState<string>();

  const onChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement & { name: keyof LoginCredentials }>) => {
    const { name, value } = event.target;
    setCredentials(credentials => ({ ...credentials, [name]: value }));
    setErrors(errors => {
      if (errors[name]) {
        delete errors[name];
        return { ...errors };
      } else return errors;
    });
  }, []);

  const onSubmit = React.useCallback((event: React.FormEvent, credentials: LoginCredentials) => {
    event.preventDefault();
    const { errors } = ValidateLoginCredentials(credentials);
    if (errors) setErrors(errors);
    else {
      setResponseError(undefined);
      setLoading(true);
      login(credentials)
        .catch(error => setResponseError(error))
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <div className="w-screen h-screen flex">
      <form //
        onSubmit={event => onSubmit(event, credentials)}
        className="max-w-sm w-full m-auto">
        <Paper className="flex flex-col gap-3.5 p-4" elevation={5}>
          <h1 className="text-2xl mb-1.5">Login</h1>

          <TextField //
            value={credentials.username}
            onChange={onChange}
            name="username"
            label="Username"
            autoComplete="username"
            error={Boolean(errors.username)}
            helperText={errors.username}
          />

          <TextField //
            value={credentials.password}
            onChange={onChange}
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password}
          />

          {responseError && <Alert severity="error">{responseError}</Alert>}

          <LoadingButton //
            loading={loading}
            variant="contained"
            size="large"
            type="submit">
            Login
          </LoadingButton>

          <Button //
            component={Link}
            to="/register"
            disabled={loading}
            variant="text"
            size="small"
            replace>
            Register
          </Button>
        </Paper>
      </form>
    </div>
  );
};

export default Login;
