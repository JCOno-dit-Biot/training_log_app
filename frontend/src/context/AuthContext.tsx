// AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

export const AuthContext = createContext<{
  isAuthenticated: boolean; setAuthenticated: (auth: boolean) => void;
}>({
  isAuthenticated: false,
  setAuthenticated: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  useEffect(() => {

    const token = localStorage.getItem("access_token")
    if (token) {
      setAuthenticated(true); // if the token has expired, it will be refreshed automatically 
      // this prevents infinite fetch loop due to global provider. 
      // To be revisited if using a different caching mechanism
    }
  }, []);

  return <AuthContext.Provider value={{ isAuthenticated, setAuthenticated }}>{children}</AuthContext.Provider>;
};
