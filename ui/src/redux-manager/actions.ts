import { store } from './store';

export type StoreAction<T = any> = { type: string; payload: T };
export type StoreActionPromise<T = any, S = unknown, J = unknown> = StoreAction<T> & { resolve: (data?: S) => void; reject: (error?: J) => void };

export const LOGIN = 'AUTH/LOGIN';
export const LOGOUT = 'AUTH/LOGOUT';
export type LoginCredentials = { username: string; password: string };
export const login = (payload: LoginCredentials) => new Promise((resolve, reject) => store.dispatch({ type: LOGIN, payload, resolve, reject }));
export const logout = () => store.dispatch({ type: LOGOUT });

export const REGISTRATION = 'AUTH/REGISTRATION';
export type RegistrationCredentials = LoginCredentials & { name: string; confirmPassword: string };
export const register = (payload: RegistrationCredentials) => new Promise((resolve, reject) => store.dispatch({ type: REGISTRATION, payload, resolve, reject }));

export const CHECK_USERNAME = 'AUTH/CHECK_USERNAME';
export const checkUsername = (payload: string) => new Promise<boolean>((resolve, reject) => store.dispatch({ type: CHECK_USERNAME, payload, resolve, reject }));

export const USER_UPDATE = 'AUTH/USER_UPDATE';
export type Userdata = Omit<User, 'uuid' | 'connected' | 'disconnected_at'>;
export const updateUser = (payload: Userdata) => new Promise((resolve, reject) => store.dispatch({ type: USER_UPDATE, payload, resolve, reject }));

export const SELECT_ROOM = 'CHAT/SELECT_ROOM';
export const selectRoom = (payload: number) => store.dispatch({ type: SELECT_ROOM, payload });

export const READ_MESSAGES = 'CHAT/READ_MESSAGES';
export const readMessages = () => store.dispatch({ type: READ_MESSAGES });

export const SEND_MESSAGE = 'CHAT/SEND_MESSAGE';
export const sendMessage = (payload: string) => new Promise((resolve, reject) => store.dispatch({ type: SEND_MESSAGE, payload, resolve, reject }));

export const LOAD_MORE = 'CHAT/LOAD_MORE';
export const loadMore = () => new Promise((resolve, reject) => store.dispatch({ type: LOAD_MORE, resolve, reject }));

export const SEARCH = 'CHAT/SEARCH';
export const search = (payload: string) => store.dispatch({ type: SEARCH, payload });

export const SELECT_CONTACT = 'CHAT/SELECT_CONTACT';
export const selectContact = (payload: string) => store.dispatch({ type: SELECT_CONTACT, payload });

export const DESELECT_ROOM = 'CHAT/DESELECT_ROOM';
export const deselectRoom = () => store.dispatch({ type: DESELECT_ROOM });

export const MESSAGE_PUSH = 'CHAT/MESSAGE_PUSH';
