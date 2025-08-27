import React from 'react';
import { UserInfo, shouldRenewToken, userInfo, logout, redirectToAuth } from '../utils/auth';

interface AuthContextType {
  userInfo: UserInfo | null,
  logout: () => void,
}

const AuthContext = React.createContext<() => AuthContextType>(() => {
  throw new Error('AuthContext not initialized');
});

export const useAuth = (): AuthContextType => {
  return React.use(AuthContext)();
};

export const AuthProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [state, setState] = React.useState<UserInfo | null>(userInfo);

  React.useEffect(() => {
    if (shouldRenewToken()) redirectToAuth();
  }, []);

  const onLogout = React.useCallback(() => {
    setState(null);
    logout();
  }, []);

  const getValue = React.useCallback(() =>
    ({ userInfo: state, logout: onLogout })
  , [state, onLogout]);

  return (
    <AuthContext value={getValue}>
      {children}
    </AuthContext>
  );
};

