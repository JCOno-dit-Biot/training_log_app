import type { Location } from "@/entities/activities/model"
import { deleteLocation } from "@/entities/settings/locations/api/managedLocation"
import { qk } from "@/shared/api/keys"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useDeleteLocation() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: number; }) => deleteLocation(id),

        onMutate: async ({ id }) => {
            // cancel in-flight queries so they don't overwrite our optimistic change
            await qc.cancelQueries({ queryKey: qk.locations() })
            await qc.cancelQueries({ queryKey: ["managed-locations"] })

            // snapshot previous state for rollback
            const prevLocations = qc.getQueryData<Location[]>(qk.locations())

            // snapshot all managed-locations queries (different searches)
            const prevManaged = qc.getQueriesData<any>({ queryKey: ["managed-locations"] })

            // optimistic: remove from lightweight cache
            qc.setQueryData<Location[]>(qk.locations(), (old = []) => old.filter((l) => l.id !== id))

            // optimistic: remove from every managed-locations cache variant
            for (const [key] of prevManaged) {
                qc.setQueryData<any[]>(key, (old = []) => old.filter((l) => l.id !== id))
            }

            return { prevLocations, prevManaged }
        },

        onError: (_err, _vars, ctx) => {
            // rollback lightweight list
            if (ctx?.prevLocations) qc.setQueryData(qk.locations(), ctx.prevLocations)

            // rollback all managed variants
            if (ctx?.prevManaged) {
                for (const [key, data] of ctx.prevManaged) {
                    qc.setQueryData(key, data)
                }
            }
        },

        onSettled: () => {
            // server truth (handles permissions, constraints, soft-delete behavior, etc.)
            qc.invalidateQueries({ queryKey: qk.locations(), refetchType: "active" })
            qc.invalidateQueries({ queryKey: ["managed-locations"], refetchType: "active" })
        },
    })
}