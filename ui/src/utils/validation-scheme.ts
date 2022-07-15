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

const USERNAME = Joi.string().alphanum().min(3).max(30).required().label('Username');
const PASSWORD = Joi.string().min(3).max(30).required().label('Password');
const NAME = Joi.string().min(3).max(50).required().label('Full Name');
const CONFIRM_PASSWORD = Joi.any().equal(Joi.ref('password')).required().label('Confirm password').messages({ 'any.only': '{{#label}} does not match' });

const LoginCredentialsScheme = Joi.object<LoginCredentials>({ username: USERNAME, password: PASSWORD });
export const ValidateLoginCredentials = (credentials: LoginCredentials) => ValidateScheme<LoginCredentials>(credentials, LoginCredentialsScheme);

const RegistrationCredentialsScheme = Joi.object<RegistrationCredentials>({
  username: USERNAME,
  password: PASSWORD,
  name: NAME,
  confirmPassword: CONFIRM_PASSWORD,
});
export const ValidateRegistrationCredentials = (credentials: RegistrationCredentials) => ValidateScheme<RegistrationCredentials>(credentials, RegistrationCredentialsScheme);

const ProfileScheme = Joi.object<User>({ name: NAME, username: USERNAME });
export const ValidateProfile = (profile: User) => ValidateScheme<User>(profile, ProfileScheme);
