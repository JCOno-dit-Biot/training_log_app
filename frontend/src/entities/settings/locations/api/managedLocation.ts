import axios from '@shared/api/axios';

import type { LocationPatch, ManagedLocation } from '../model/ManagedLocation';

export const getManagedLocations = async (search: string): Promise<ManagedLocation[]> => {
    const params = new URLSearchParams()
    if (search?.trim()) params.set("search", search.trim())
    const res = await axios.get(`/locations/manage?${params.toString()}`);
    return res.data;
};

export async function patchLocation(id: number, patch: LocationPatch) {
    const res = await axios.patch(`/locations/${id}`, patch)
    return res.data
}

export async function deleteLocation(id: number) {
    const res = await axios.delete(`/locations/${id}`)
    return res.data
}
