import axios from './authAxios';

export const logout = async(): Promise<void> => {
    const res = await axios.post('/logout', null, {withCredentials: true});
}