import Header from './Header';

const Layout = ({ children }: { children: JSX.Element }) => (
  <div className="max-w-screen-xl mx-auto h-screen flex flex-col divide-y-2 border-2">
    <Header />
    <div className="grow">{children}</div>
  </div>
);

export default Layout;
