import { createContext, useContext } from 'react';

import { type User } from '@shared/api/authAxios';

export type SessionStatus = 'unknown' | 'authenticated' | 'guest';

export type AuthContextShape = {
    status: SessionStatus;
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextShape | null>(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('AuthProvider missing');
    return ctx;
};
