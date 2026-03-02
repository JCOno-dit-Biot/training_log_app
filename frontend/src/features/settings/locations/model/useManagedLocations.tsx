import { getManagedLocations } from "@/entities/settings/locations/api/managedLocation"
import type { ManagedLocation } from "@/entities/settings/locations/model/ManagedLocation"
import { qk } from "@/shared/api/keys"

import { useQuery } from "@tanstack/react-query"

export function useManagedLocations(search?: string) {
    return useQuery<ManagedLocation[]>({
        queryKey: qk.managedLocations(search),
        queryFn: () => getManagedLocations(search),
        staleTime: 1000 * 60 * 5, // 5 min — locations don’t change often
    })
}