import { store } from './store';

export type StoreAction<T = any> = { type: string; payload: T };

export const LOGIN = 'AUTH/LOGIN';
export const LOGOUT = 'AUTH/LOGOUT';
export type LoginCredentials = { username: string; password: string };
export const login = (payload: LoginCredentials) => store.dispatch({ type: LOGIN, payload });
export const logout = () => store.dispatch({ type: LOGOUT });

export const REGISTRATION = 'AUTH/REGISTRATION';
export type RegistrationCredentials = LoginCredentials & { name: string; confirmPassword: string };
export const register = (payload: RegistrationCredentials) => store.dispatch({ type: REGISTRATION, payload });
