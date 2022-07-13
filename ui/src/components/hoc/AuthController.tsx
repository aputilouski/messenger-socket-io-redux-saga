import { useStore } from 'redux-manager';
import { Redirect } from 'react-router-dom';

const AuthController = ({ children }: { children: JSX.Element }) => {
  const { authorized } = useStore(state => state.auth);
  return authorized ? children : <Redirect to="/" />;
};

export default AuthController;
