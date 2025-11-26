import { createWeight, updateWeight } from "@/entities/dogs/api/weight";
import type { FetchWeightsParams, WeightEntry, WeightPatch } from "@/entities/dogs/model";
import { qk } from "@/shared/api/keys";

import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateWeightVars = {
    input: Omit<WeightEntry, 'id'>;
    listParams?: FetchWeightsParams;
};

type UpdateWeightVars = {
    id: number;
    patch: WeightPatch;
};

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

export function useCreateWeight() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ input }: CreateWeightVars) => createWeight(input),

        onMutate: async ({ input, listParams }) => {
            const key = listParams ? qk.weights(listParams) : undefined;
            if (!key) return { key: undefined, prev: undefined as WeightEntry[] | undefined };

            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData<WeightEntry[]>(key) ?? [];

            // Optimistically add only if the entry fits current filters
            if (fitsList(input, listParams)) {
                const temp: WeightEntry = { ...input, id: -Date.now() };
                qc.setQueryData<WeightEntry[]>(key, insertSorted(prev, temp));
            }

            // We only need prev + key; the temp row will be blown away by invalidation
            return { key, prev };
        },

        onError: (_err, _vars, ctx) => {
            if (ctx?.key) qc.setQueryData<WeightEntry[]>(ctx.key, ctx.prev);
        },

        onSettled: (_res, _err) => {
            // invalidate all weight keys to make sure it gets refetched (graph + latest data)
            qc.invalidateQueries({ queryKey: ['weights'] });
        },
    });
}

export function useUpdateWeight() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ id, patch }: UpdateWeightVars) => updateWeight(id, patch),

        onSuccess: () => {
            // Refresh graph + latest grid
            qc.invalidateQueries({ queryKey: ["weights"] });
        },
    });
}
