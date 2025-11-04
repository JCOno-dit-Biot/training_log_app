import { createWeight } from "@/entities/dogs/api/weight";
import type { FetchWeightsParams, WeightEntry } from "@/entities/dogs/model";
import { qk } from "@/shared/api/keys";

import { useMutation, useQueryClient } from "@tanstack/react-query";

// Check if the new entry belongs to a specific list based on filters
function fitsList(entry: Omit<WeightEntry, 'id'>, p?: FetchWeightsParams) {
    if (!p) return true;
    if (p.dogId != null && entry.dog_id !== p.dogId) return false;

    if (p.start_date && new Date(entry.date) < new Date(p.start_date)) return false;
    if (p.end_date && new Date(entry.date) > new Date(p.end_date)) return false;

    return true;
}

// Keep entries in reverse-chronological order
function insertSorted(list: WeightEntry[], item: WeightEntry) {
    const out = [item, ...list];
    out.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return out;
}

export function useCreateWeight(listParams?: FetchWeightsParams) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: Omit<WeightEntry, 'id'>) => createWeight(input),

        onMutate: async (input) => {
            let tempId: number | undefined
            const key = listParams ? qk.weights(listParams) : undefined;
            if (!key) return { key: undefined, prev: undefined };

            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData<WeightEntry[]>(key) ?? [];

            // Optimistically add only if the entry fits current filters
            if (fitsList(input, listParams)) {
                const tempId = -Date.now();
                const temp: WeightEntry = { ...input, id: tempId };
                qc.setQueryData<WeightEntry[]>(key, insertSorted(prev, temp));
                return { key, prev };
            }

            return { key, prev, tempId };
        },

        onError: (_err, _vars, ctx) => {
            if (ctx?.key) qc.setQueryData(ctx.key, ctx.prev);
        },

        onSuccess: (res, input, ctx) => {
            // Replace temp id with the real one
            if (ctx?.key && ctx.tempId != null) {
                qc.setQueryData<WeightEntry[]>(ctx.key, (old = []) =>
                    old.map(e => (e.id === ctx.tempId ? { ...e, id: res.id } : e))
                );
            }
        },

        onSettled: () => {
            if (listParams) qc.invalidateQueries({ queryKey: qk.weights(listParams) });
        },
    });
}