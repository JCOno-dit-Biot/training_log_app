import { authAxios } from '@shared/api/authAxios';

export const logout = async (): Promise<void> => {
  await authAxios.post('/logout', null, { withCredentials: true });
};
