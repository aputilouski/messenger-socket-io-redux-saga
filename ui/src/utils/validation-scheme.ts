import Joi from 'joi';
import { LoginCredentials, RegistrationCredentials } from 'redux-manager';

type ValidateObject = { [key: string]: string };
const ValidateScheme = <T>(fields: ValidateObject, scheme: Joi.ObjectSchema): { errors: Partial<T> | undefined } => {
  const { error } = scheme.validate(fields, { abortEarly: false });
  if (error?.details?.length) {
    const errors: Partial<ValidateObject> = {};
    (Object.keys(fields) as (keyof { [key: string]: string })[]).forEach(key => {
      const details = error.details.find(e => e.path.includes(key));
      if (details) errors[key] = details.message;
    });
    return { errors: errors as Partial<T> };
  } else return { errors: undefined };
};

const LoginCredentialsSchemeKeys = {
  username: Joi.string().alphanum().min(3).max(30).required().label('Username'),
  password: Joi.string().min(3).max(30).required().label('Password'),
};
const LoginCredentialsScheme = Joi.object<LoginCredentials>(LoginCredentialsSchemeKeys);
export const ValidateLoginCredentials = (credentials: LoginCredentials) => ValidateScheme<LoginCredentials>(credentials, LoginCredentialsScheme);

const RegistrationCredentialsSchemeKeys = {
  ...LoginCredentialsSchemeKeys,
  name: Joi.string().min(3).max(50).required().label('Full Name'),
  confirmPassword: Joi.any().equal(Joi.ref('password')).required().label('Confirm password').messages({ 'any.only': '{{#label}} does not match' }),
};
const RegistrationCredentialsScheme = Joi.object<RegistrationCredentials>(RegistrationCredentialsSchemeKeys);
export const ValidateRegistrationCredentials = (credentials: RegistrationCredentials) => ValidateScheme<RegistrationCredentials>(credentials, RegistrationCredentialsScheme);
