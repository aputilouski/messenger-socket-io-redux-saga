import { store } from './store';
import authSlice from './slices/auth';

export type StoreAction<T = any> = { type: string; payload: T };

export const LOGIN = 'AUTH/LOGIN';
export const LOGOUT = 'AUTH/LOGOUT';
export type LoginCredentials = { username: string; password: string };
export const login = (payload: LoginCredentials) => store.dispatch({ type: LOGIN, payload });
export const logout = () => store.dispatch({ type: LOGOUT });

export const REGISTRATION = 'AUTH/REGISTRATION';
export type RegistrationCredentials = LoginCredentials & { name: string; confirmPassword: string };
export const register = (payload: RegistrationCredentials) => store.dispatch({ type: REGISTRATION, payload });

export const CHECK_USERNAME = 'AUTH/CHECK_USERNAME';
export const checkUsername = (payload: string) => store.dispatch({ type: CHECK_USERNAME, payload });
export const setUserAvailable = authSlice.actions.setUserAvailable;

export const USER_UPDATE = 'AUTH/USER_UPDATE';
export const updateUser = (payload: { user: User; callback: () => void }) => store.dispatch({ type: USER_UPDATE, payload });
