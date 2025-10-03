import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLocations, createLocation } from '../api/locations';
import { Location } from '../types/Activity';
import { qk } from '../api/keys';

export function useLocations({ enabled = true, staleTime = 30 * 60_000 } = {}) {
    const q = useQuery({
        queryKey: qk.locations(),
        queryFn: getLocations,
        enabled,
        staleTime,
        gcTime: 2 * 60 * 60_000,
        refetchOnMount: false,
        placeholderData: (prev) => prev
    });

    const byId = useMemo(
        () => new Map<number, Location>((q.data ?? []).map(d => [d.id, d])),
        [q.data]
    );

    return { ...q, list: q.data ?? [], byId };
}

export function useCreateLocation({ revalidate = false, sortByName = true }: { revalidate?: boolean, sortByName?: boolean } = {}) {
    const qc = useQueryClient();
    return useMutation<Location, unknown, string, { prevList?: Location[]; tempId: number }>({
        mutationFn: (name: string) => createLocation(name),

        onMutate: async ({ name }) => {
            await qc.cancelQueries({ queryKey: qk.locations() });

            const prevList = qc.getQueryData<Location[]>(qk.locations());
            const tempId = Number.MIN_SAFE_INTEGER + Math.floor(Math.random() * 10_000);
            const optimistic: Location = { id: tempId, name: name };

            qc.setQueryData<Location[]>(qk.locations(), (old = []) => {
                const next = [optimistic, ...old];
                return sortByName ? [...next].sort((a, b) => a.name.localeCompare(b.name)) : next;
            });

            return { prevList, tempId };
        },
        onError: (_err, vars, ctx) => {
            // rollback on error
            if (ctx?.prevList) qc.setQueryData(qk.dogs(), ctx.prevList);
        },

        onSuccess: (created, _name, ctx) => {
            qc.setQueryData<Location[]>(qk.locations(), (old = []) => {
                const replaced = old.map(loc => (loc.id === ctx?.tempId ? created : loc));
                return sortByName ? [...replaced].sort((a, b) => a.name.localeCompare(b.name)) : replaced;
            });
            if (revalidate) {
                qc.invalidateQueries({ queryKey: qk.locations(), refetchType: 'active' });
            }
        },
        });
}