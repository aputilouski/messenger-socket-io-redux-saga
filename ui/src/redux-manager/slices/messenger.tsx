import { createSlice } from '@reduxjs/toolkit';

// type AuthSlice = {
// };

export default createSlice({
  name: 'messenger',
  initialState: {
    rooms: [],
    chat: {
      meta: null,
      history: [],
    },
  },
  reducers: {},
});
