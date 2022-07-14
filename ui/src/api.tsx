import { LoginCredentials, RegistrationCredentials } from 'redux-manager';
import axios, { AxiosError } from 'axios';
import { notify } from 'utils';
import { logout } from 'redux-manager';

const DEFAULT_ERROR_MESSAGE = 'An unexpected problem has occurred, please try again later.';
axios.interceptors.response.use(
  response => {
    if (response.data.message) notify.success(response.data.message);
    return response;
  },
  error => {
    let message = DEFAULT_ERROR_MESSAGE;
    if (error.response?.data) {
      const dataType = typeof error.response.data;
      if (dataType === 'string') message = error.response.data;
      else if (dataType === 'object') message = error.response.data.message;
    }
    notify.error(message);
    if (error.response?.status === 401) logout();
    throw error;
  }
);

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
