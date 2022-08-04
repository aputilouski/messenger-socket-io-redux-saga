import React from 'react';
import { TextField, Button, Paper, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Link } from 'react-router-dom';
import { RegistrationCredentials, register, checkUsername } from 'redux-manager';
import { ValidateRegistrationCredentials } from 'utils/validation-scheme';

const Register = () => {
  const [credentials, setCredentials] = React.useState<RegistrationCredentials>({ name: '', username: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = React.useState<Partial<RegistrationCredentials>>({});

  const [loading, setLoading] = React.useState(false);
  const [responseError, setResponseError] = React.useState<string>();

  const [usernameAvailable, setUsernameAvailable] = React.useState<boolean>();

  const usernameNotAvailable = usernameAvailable === false;

  const onChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement & { name: keyof RegistrationCredentials }>) => {
    const { name, value } = event.target;
    if (name === 'username' && value.trim()) checkUsername(value).then(setUsernameAvailable);
    setCredentials(credentials => ({ ...credentials, [name]: value }));
    setErrors(errors => {
      if (errors[name]) {
        delete errors[name];
        return { ...errors };
      } else return errors;
    });
  }, []);

  const onSubmit = React.useCallback((event: React.FormEvent, credentials: RegistrationCredentials, userNotAvailable: boolean) => {
    event.preventDefault();
    if (userNotAvailable) return;
    const { errors } = ValidateRegistrationCredentials(credentials);
    if (errors) setErrors(errors);
    else {
      setResponseError(undefined);
      setLoading(true);
      register(credentials)
        .catch(error => setResponseError(error))
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <div className="w-screen h-screen flex">
      <form //
        onSubmit={event => onSubmit(event, credentials, usernameNotAvailable)}
        className="max-w-sm w-full m-auto">
        <Paper className="flex flex-col gap-3.5 p-4" elevation={5}>
          <h1 className="text-2xl mb-1.5">Registration</h1>

          <TextField //
            value={credentials.username}
            onChange={onChange}
            name="username"
            label="Username"
            error={usernameNotAvailable || Boolean(errors.username)}
            helperText={usernameNotAvailable ? 'Username is already in use' : errors.username}
            color={usernameAvailable ? 'success' : undefined}
          />

          <TextField //
            value={credentials.name}
            onChange={onChange}
            name="name"
            label="Full Name"
            error={Boolean(errors.name)}
            helperText={errors.name}
          />

          <TextField //
            value={credentials.password}
            onChange={onChange}
            name="password"
            label="Password"
            type="password"
            autoComplete="off"
            error={Boolean(errors.password)}
            helperText={errors.password}
          />

          <TextField //
            value={credentials.confirmPassword}
            onChange={onChange}
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            autoComplete="off"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword}
          />

          {responseError && <Alert severity="error">{responseError}</Alert>}

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
