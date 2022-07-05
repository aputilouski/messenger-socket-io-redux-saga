import React from 'react';
import { RootState } from 'redux-manager';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AuthController = ({ children }: { children: JSX.Element }) => {
  const navigate = useNavigate();
  const { authorized } = useSelector((state: RootState) => state.auth);
  React.useEffect(() => {
    navigate(authorized ? '/channels' : '/', { replace: true });
  }, [authorized, navigate]);
  return children;
};

export default AuthController;
