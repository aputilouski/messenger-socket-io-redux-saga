import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login, Register, Channels } from './pages';
import { Layout } from 'components';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="channels" element={<Layout />}>
        <Route index element={<Channels />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
