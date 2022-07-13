import { LoginCredentials, RegistrationCredentials } from 'redux-manager';
import axios, { AxiosError } from 'axios';

const endpoints = {
  login: '/auth/login',
  register: '/auth/register',
  checkUsername: '/auth/check-username',
};

const api = {
  login: (credentials: LoginCredentials) => axios.post<{ token: string; user: User }>(endpoints.login, credentials),
  register: (credentials: RegistrationCredentials) => axios.post(endpoints.register, credentials),
  checkUsername: (username: string) => axios.post<{ available: boolean }>(endpoints.checkUsername, { username }),
};

export type ApiError = AxiosError<{ message?: string }>;

export const isApiError = (payload: any): payload is ApiError => axios.isAxiosError(payload);

export const getErrorMessage = (e: unknown): string => (isApiError(e) ? e.response?.data.message || 'Oops, Something went wrong...' : (e as Error).message);

export default api;
