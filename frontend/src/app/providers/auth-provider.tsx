import { useCallback, useEffect, useMemo, useState } from 'react';

import { authStorage } from '@app/auth/auth-storage';
import { type User, validateToken } from '@shared/api/authAxios';
import { refreshAccessToken } from '@shared/api/axios';
import { getToken } from '@entities/auth/api/token';

import { AuthContext, type AuthContextShape, type SessionStatus } from '../auth/auth-context';

import { useQueryClient } from '@tanstack/react-query';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const qc = useQueryClient();
  const [status, setStatus] = useState<SessionStatus>('unknown');
  const [user, setUser] = useState<User | null>(null);

  // Boot: try to restore session by refreshing access token or calling /me
  // ---- Boot: run once on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { access_token } = authStorage.get();
      if (!access_token) {
        if (!cancelled) setStatus('guest');
        return;
      }

      // Try validate; if expired, try refresh then validate again
      let me: User | null = null;
      try {
        me = await validateToken(access_token);
      } catch {
        const newTok = await refreshAccessToken(access_token);
        if (newTok) {
          try {
            me = await validateToken(newTok);
          } catch {
            // still invalid
          }
        }
      }

      if (cancelled) return;

      if (me) {
        setUser(me);
        setStatus('authenticated');
      } else {
        authStorage.clear();
        setUser(null);
        setStatus('guest');
        qc.clear();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [qc]);

  const login = useCallback(async (email: string, password: string) => {
    const body = new URLSearchParams({ username: email, password });
    const token = await getToken(body);
    const access = token.access_token as string | undefined;
    if (!access) throw new Error('Missing access_token');
    authStorage.set({ access_token: access });

    const me = await validateToken(access);
    setUser(me);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setUser(null);
    setStatus('guest');
    qc.clear();
  }, [qc]);

  const value = useMemo<AuthContextShape>(
    () => ({
      status,
      user,
      isAuthenticated: status === 'authenticated',
      login,
      logout,
    }),
    [status, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
