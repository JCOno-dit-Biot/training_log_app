// AuthContext.tsx
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { authStorage } from '../functions/auth/authStorage';
import api from '../api/axios';
import { getToken } from '../api/auth/token';
import { logout } from '../api/auth/logout';
import { useQueryClient } from '@tanstack/react-query';

type SessionStatus = 'unknown' | 'authenticated' | 'guest';
type User={id?: number, username: string}

type AuthContextShape = {
  status: SessionStatus;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextShape | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthProvider missing');
  return ctx;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const qc = useQueryClient();
  const [status, setStatus] = useState<SessionStatus>('unknown');
  const [user, setUser] = useState<User | null>(null);

  // Boot: try to restore session by refreshing access token or calling /me
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const hasAnyToken = !!authStorage.get().access_token;
      if (!hasAnyToken) {
        setStatus('guest');
        return;
      }
      try {
        // Option A) call dedicated refresh endpoint (already in axios refresh)
        // Option B) call /me to validate token and grab user
        const me = await api.get('/auth/me').then(r => r.data as User); // adjust path
        if (!cancelled) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        if (!cancelled) {
          authStorage.clear();
          setUser(null);
          setStatus('guest');
        }
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const body = new URLSearchParams({ username: email, password });
    const token = await getToken(body)

    if (token.access_token) authStorage.set({ access_token: token.access_token });

    setUser( {username: email} );
    setStatus('authenticated');
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
    setStatus('guest');
    qc.clear(); // prevent cross-user leakage of cached server data
  };

  const value = useMemo<AuthContextShape>(
    () => ({
      status,
      user,
      isAuthenticated: status === 'authenticated',
      login,
      logout,
    }),
    [status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
