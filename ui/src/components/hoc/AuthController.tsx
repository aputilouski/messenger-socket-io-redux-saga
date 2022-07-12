import React from 'react';
import { RootState } from 'redux-manager';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AuthController = ({ children }: { children: JSX.Element }) => {
  const navigate = useNavigate();
  const navigateRef = React.useRef(navigate); // this ref is used to rid useEffect of the dependency on navigate that causes it to fire
  navigateRef.current = navigate;

  const { authorized } = useSelector((state: RootState) => state.auth);
  React.useEffect(() => navigateRef.current(authorized ? '/channels' : '/', { replace: true }), [authorized]);

  return children;
};

export default AuthController;
