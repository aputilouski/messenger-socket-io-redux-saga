import { createSlice, configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
  },
  reducers: {},
});

// const todoSlice = createSlice({
//   name: 'todo',
//   initialState: {
//     todos: [],
//   },
//   reducers: {
//     fetchData: (state, action) => {
//       return {
//         todos: action.payload,
//       };
//     },
//   },
// });

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    // todo: todoSlice.reducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export default store;
