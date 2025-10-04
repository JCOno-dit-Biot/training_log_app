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

    const upsert = (list: Location[], loc: Location) => {
        const exists = list.some(l => l.id === loc.id);
        const next = exists ? list : [loc, ...list];
        return sortByName ? [...next].sort((a, b) => a.name.localeCompare(b.name)) : next;
    };

    // base mutation no de-duplication
    const base = useMutation<Location, unknown, { name: string; tempId?: number }, { prev?: Location[]; tempId?: number }>({
        mutationFn: ( { name }) => {
            // Not a dup: call server
            const created = createLocation(name); // api returns Location
            return created; // normalize to CreateResult in onSuccess
        },

        // 2) onMutate: optimistic append only if not a dup in cache
        onMutate: async (name) => {
            await qc.cancelQueries({ queryKey: qk.locations() });

            const prev = qc.getQueryData<Location[]>(qk.locations());

            // Append a temp row
            const tempId = Number.MIN_SAFE_INTEGER + Math.floor(Math.random() * 10_000);
            const optimistic: Location = { id: tempId, name };

            qc.setQueryData<Location[]>(qk.locations(), (old = []) =>
                upsert(old, optimistic)
            );

            return { prev, tempId };
        },
        // 3) onError: rollback only if we appended a temp
        onError: (err, _name, ctx) => {
            if (ctx?.prev) {
                qc.setQueryData(qk.locations(), ctx?.prev);
            }

            // If server said 409, refetch to get the existing item then leave it to the caller to select
            if (err?.response?.status === 409) {
                qc.invalidateQueries({ queryKey: qk.locations(), refetchType: 'active' });
            }
        },

        // 4) onSuccess: replace temp or upsert result; surface created/existing
        onSuccess: (created, _name, ctx) => {

            qc.setQueryData<Location[]>(qk.locations(), (old = []) => {
                // If we appended a temp, replace it; otherwise just upsert the real row
                if (ctx.tempId != null) {
                    const replaced = old.map(l => (l.id === ctx.tempId ? created : l));
                    return sortByName ? [...replaced].sort((a, b) => a.name.localeCompare(b.name)) : replaced;
                }
                return upsert(old, created);
            });
            },
  });


            // Smart wrapper that PRE-checks duplicates before calling the mutation
            const createLocationSmart = async (rawName: string): Promise<{ location: Location; created: boolean }> => {
                const name = rawName.trim();
                if (!name) throw new Error('Location name required');

                const cached = (qc.getQueryData<Location[]>(qk.locations()) ?? []);
                const existing = cached.find(l => normalize(l.name) === normalize(name));
                if (existing) {
                    // No network, no optimistic; just return existing
                    return { location: existing, created: false };
                }

                const created = await base.mutateAsync({ name });
                return { location: created, created: true };
            };

            return {
                createLocation: createLocationSmart,
                isPending: base.isPending,
            };
        }