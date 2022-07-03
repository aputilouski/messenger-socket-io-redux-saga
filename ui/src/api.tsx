import { LoginCredentials } from 'redux-manager';
import axios from 'axios';

const endpoints = {
  login: '/auth/login',
};

const api = {
  login: (credentials: LoginCredentials) => axios.post(endpoints.login, credentials),
};

export default api;
