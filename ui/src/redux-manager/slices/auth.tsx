import { createSlice } from '@reduxjs/toolkit';
import { StoreAction } from '../store';

type AuthSlice = {
  token: string | null;
  user: User | null;
  authorized: boolean;
  loading: boolean;
  error: string | undefined;
};

export default createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    authorized: false,
    loading: false,
    error: undefined,
  } as AuthSlice,
  reducers: {
    login: (state, action: StoreAction<{ token: string; user: User }>) => {
      const { user, token } = action.payload;
      return { ...state, user, token, loading: false, authorized: true };
    },
    runLoading: state => ({ ...state, loading: true, error: undefined }),
    catchError: (state, action: StoreAction<string>) => ({ ...state, error: action.payload, loading: false }),
  },
});
