import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login, Register, Channels } from './pages';
import { Layout } from 'components';
import Theme from 'Theme';
import { Provider } from 'react-redux';
import store from 'redux/store';

const App = () => (
  <Theme>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="channels" element={<Layout />}>
            <Route index element={<Channels />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </Theme>
);

export default App;
