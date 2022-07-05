import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login, Register, Channels } from './pages';
import { Layout, AuthController } from 'components';
import Theme from 'Theme';
import { Provider } from 'react-redux';
import { store } from 'redux-manager';

const App = () => (
  <Theme>
    <Provider store={store}>
      <BrowserRouter>
        <AuthController>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="channels" element={<Layout />}>
              <Route index element={<Channels />} />
            </Route>
          </Routes>
        </AuthController>
      </BrowserRouter>
    </Provider>
  </Theme>
);

export default App;
