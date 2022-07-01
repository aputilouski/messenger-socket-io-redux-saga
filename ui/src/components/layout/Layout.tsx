import Header from './Header';
import { Outlet } from 'react-router-dom';

const Layout = () => (
  <div className="max-w-screen-xl mx-auto h-screen flex flex-col divide-y-2 border-2">
    <Header />
    <div className="grow">
      <Outlet />
    </div>
  </div>
);

export default Layout;
