import axios from '@shared/api/axios';

import type { ManagedLocation } from '../model/ManagedLocation';

export const getManagedLocations = async (search: string): Promise<ManagedLocation[]> => {
    const params = new URLSearchParams()
    if (search?.trim()) params.set("search", search.trim())
    const res = await axios.get(`/locations/manage?${params.toString()}`);
    return res.data;
};