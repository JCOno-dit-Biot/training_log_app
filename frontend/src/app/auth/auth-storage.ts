import type { Token } from '@/entities/auth/model/Token';

const ACCESS_KEY = 'access_token';

export const authStorage = {
  get(): Partial<Token> {
    return {
      access_token: localStorage.getItem(ACCESS_KEY),
    };
  },
  set(tokens: Partial<Token>) {
    if (tokens.access_token !== undefined) {
      tokens.access_token
        ? localStorage.setItem(ACCESS_KEY, tokens.access_token)
        : localStorage.removeItem(ACCESS_KEY);
    }
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
  },
};
