
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDogs, updateDog as updateDogApi } from '../api/dogs';
import { Dog } from '../types/Dog';
import { qk } from '../api/keys';

export function useDogs({ enabled = true, staleTime = 30 * 60_000 } = {}) {
  const q = useQuery({
    queryKey: qk.dogs(),
    queryFn: getDogs,
    enabled,
    staleTime,
    gcTime: 2 * 60 *60_000,
    refetchOnMount: false,
    placeholderData: (prev) => prev
  });

  const byId = useMemo(
    () => new Map<number, Dog>((q.data ?? []).map(d => [d.id, d])),
    [q.data]
  );

  return { ...q, list: q.data ?? [], byId };
}

export function useUpdateDog({ revalidate = true }: { revalidate?: boolean } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, diff }: { id: number; diff: Partial<Dog> }) => updateDogApi(id, diff),

    onMutate: async ({ id, diff }) => {
      await qc.cancelQueries({ queryKey: qk.dogs() });
      await qc.cancelQueries({ queryKey: qk.dog(id) });

      const prevList = qc.getQueryData<Dog[]>(qk.dogs());
      const prevDetail = qc.getQueryData<Dog>(qk.dog(id));

      // optimistic patch for list
      if (prevList) {
        qc.setQueryData<Dog[]>(qk.dogs(), prevList.map((d) => (d.id === id ? { ...d, ...diff } : d)));
      }
      // optimistic patch for detail
      if (prevDetail) {
        qc.setQueryData<Dog>(qk.dog(id), { ...prevDetail, ...diff });
      }

      return { prevList, prevDetail };
    },
    onError: (_err, vars, ctx) => {
      // rollback on error
      if (ctx?.prevList) qc.setQueryData(qk.dogs(), ctx.prevList);
      if (ctx?.prevDetail) qc.setQueryData(qk.dog(vars.id), ctx.prevDetail);
    },

    onSuccess: (_ok, vars) => {
      if (revalidate) {
        qc.invalidateQueries({ queryKey: qk.dogs(), refetchType: 'active' });
        qc.invalidateQueries({ queryKey: qk.dog(vars.id) });
      }
    }
  });
}
