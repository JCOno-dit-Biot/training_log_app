import { useMemo } from 'react';

import { qk } from '@shared/api/keys';
import { getRunners, updateRunner, uploadRunnerImage } from '@entities/runners/api/runners';
import type { Runner } from '@entities/runners/model';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useRunners({ enabled = true, staleTime = 2 * 60 * 60_000 } = {}) {
  const q = useQuery({
    queryKey: qk.runners(),
    queryFn: getRunners,
    enabled,
    staleTime,
    gcTime: 12 * 60 * 60_000,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
  });

  const byId = useMemo(
    () => new Map<number, Runner>((q.data ?? []).map((d) => [d.id, d])),
    [q.data],
  );

  return { ...q, list: q.data ?? [], byId };
}


export function useUpdateRunner({ revalidate = true }: { revalidate?: boolean } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, diff }: { id: number; diff: Partial<Runner> }) => updateRunner(id, diff),

    onMutate: async ({ id, diff }) => {
      await qc.cancelQueries({ queryKey: qk.runners() });

      const prevList = qc.getQueryData<Runner[]>(qk.runners());

      // optimistic patch for list
      if (prevList) {
        qc.setQueryData<Runner[]>(
          qk.runners(),
          prevList.map((d) => (d.id === id ? { ...d, ...diff } : d)),
        );
      }

      return { prevList };
    },
    onError: (_err, vars, ctx) => {
      // rollback on error
      if (ctx?.prevList) qc.setQueryData(qk.runners(), ctx.prevList);
    },

    onSuccess: (_ok) => {
      if (revalidate) {
        qc.invalidateQueries({ queryKey: qk.runners(), refetchType: 'active' });
      }
    },
  });
}

export function useUploadRunnerPicture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number, file: File }) => uploadRunnerImage(id, file),

    onSuccess: (_ok) => {
      qc.invalidateQueries({ queryKey: qk.runners(), refetchType: 'active' });
    }
  });

}