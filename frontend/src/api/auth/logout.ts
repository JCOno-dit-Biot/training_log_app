import { authAxios } from "./authAxios";

export const logout = async(): Promise<void> => {
    const res = await authAxios.post('/logout', null, {withCredentials: true});
}