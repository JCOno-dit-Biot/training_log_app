import axios from '@shared/api/axios';

import type { Runner } from '../model';

export const getRunners = async (): Promise<Runner[]> => {
  const res = await axios.get('/runners');
  return res.data;
};
