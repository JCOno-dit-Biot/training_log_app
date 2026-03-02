import type { Location } from "@/entities/activities/model"
import { patchLocation } from "@/entities/settings/locations/api/managedLocation"
import { type LocationPatch } from "@/entities/settings/locations/model/ManagedLocation"
import { qk } from "@/shared/api/keys"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useUpdateLocation() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: ({ id, patch }: { id: number; patch: LocationPatch }) => patchLocation(id, patch),

        onSuccess: (_res, vars) => {
            // update lightweight cache (id/name) if name changed
            if (vars.patch.name) {
                qc.setQueryData<Location[]>(qk.locations(), (old = []) =>
                    old.map((l) => (l.id === vars.id ? { ...l, name: vars.patch.name! } : l)),
                )
            }

            // simplest: invalidate managed lists (all searches)
            qc.invalidateQueries({ queryKey: ["managed-locations"] })

            // and invalidate lightweight list too (source of truth)
            qc.invalidateQueries({ queryKey: qk.locations(), refetchType: "active" })
        },
    })
}