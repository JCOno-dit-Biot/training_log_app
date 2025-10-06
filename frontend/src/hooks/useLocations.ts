import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLocations, createLocation } from '../api/locations';
import { Location } from '../types/Activity';
import { qk } from '../api/keys';

type CreateResult = { location: Location; created: boolean };

const normalize = (s: string) => s.trim().toLowerCase();

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

export function useCreateLocation({ sortByName = true }: { sortByName?: boolean } = {}) {
    const qc = useQueryClient();
    const key = qk.locations();

    const upsert = (list: Location[], loc: Location) => {
        const exists = list.some(l => l.id === loc.id);
        const next = exists ? list : [loc, ...list];
        return sortByName ? [...next].sort((a, b) => a.name.localeCompare(b.name)) : next;
    };

    return useMutation<Location, any, string, { prev?: Location[]; tempId?: number }>({
        mutationFn: (name: string) => createLocation(name.trim()), // MUST return {id, name}

        onMutate: async (rawName) => {
            await qc.cancelQueries({ queryKey: key });

            const prev = qc.getQueryData<Location[]>(key);
            const name = rawName.trim();
            const tempId = -Date.now(); // unique negative id

            const optimistic: Location = { id: tempId, name };
            qc.setQueryData<Location[]>(key, (old = []) => upsert(old, optimistic));

            return { prev, tempId };
        },

        onError: (_err, _name, ctx) => {
            // rollback to previous list
            if (ctx?.prev) qc.setQueryData(key, ctx.prev);
        },

        onSuccess: (created, _name, ctx) => {
            // replace temp with server row
            qc.setQueryData<Location[]>(key, (old = []) =>
                old.map(l => (l.id === ctx?.tempId ? created : l))
            );
        },

        onSettled: () => {
            // keep server as source of truth for ordering / dedup w.r.t other clients
            qc.invalidateQueries({ queryKey: key, refetchType: 'active' });
        },
    });
}
