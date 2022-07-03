import { createSlice } from '@reduxjs/toolkit';

export default createSlice({
  name: 'auth',
  initialState: {
    loading: false,
    token: null,
    user: null,
  },
  reducers: {
    login: (state, action) => {
      console.log(action);
      return state;
    },
    loading: (state, action) => ({ ...state, loading: action.payload }),
  },
});
