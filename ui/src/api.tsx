import { LoginCredentials } from 'redux-manager';
import axios, { AxiosError } from 'axios';

const endpoints = {
  login: '/auth/login',
};

const api = {
  login: (credentials: LoginCredentials) => axios.post<{ token: string; user: User }>(endpoints.login, credentials),
};

export type ApiError = AxiosError<{ message?: string }>;

export const isApiError = (payload: any): payload is ApiError => axios.isAxiosError(payload);

export const getErrorMessage = (e: unknown): string => (isApiError(e) ? e.response?.data.message || 'Oops, Something went wrong...' : (e as Error).message);

export default api;
