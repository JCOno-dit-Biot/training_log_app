import { qk } from '@shared/api/keys';
import {
  deleteActivity as deleteActivityApi,
  getActivity,
  postActivity as createActivityApi,
  updateActivity as updateActivityApi,
} from '@entities/activities/api/activities';
import type { Activity, ActivityForm, PaginatedActivities } from '@entities/activities/model';

import { useMutation, useQueryClient } from '@tanstack/react-query';

/** Helpers to touch ALL cached feed pages (any filters/offset/limit currently in cache) */
function snapshotAllActivityPages(qc: ReturnType<typeof useQueryClient>) {
  return qc
    .getQueriesData<PaginatedActivities>({ queryKey: ['activities'] })
    .map(([key, page]) => ({ key, page }));
}

function setAllActivityPages(
  qc: ReturnType<typeof useQueryClient>,
  mapper: (page: PaginatedActivities) => PaginatedActivities,
) {
  qc.getQueriesData<PaginatedActivities>({ queryKey: ['activities'] }).forEach(([key, page]) => {
    if (!page) return;
    qc.setQueryData<PaginatedActivities>(key, mapper(page));
  });
}

/** CREATE: returns id, unknown page => prefetch detail, invalidate active lists */
export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActivityForm) => createActivityApi(payload) as Promise<number>,
    onSuccess: async (id: number) => {
      // Hydrate detail cache so if you navigate to it the data is instant
      try {
        const detail = await getActivity(id);
        qc.setQueryData(qk.activity(id), detail);
      } catch {
        // ignore; detail will fetch on demand
      }
      // Let the server place the new record wherever it belongs
      qc.invalidateQueries({ queryKey: ['activities'], refetchType: 'active' });
    },
  });
}

/** UPDATE: boolean return => optimistic patch + optional revalidate */
export function useUpdateActivity({ revalidate = true }: { revalidate?: boolean } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, diff }: { id: number; diff: Record<string, unknown> }) =>
      updateActivityApi(id, diff), // boolean

    onSuccess: (_ok, { id }) => {
      // Only re-fetch pages that are mounted (no background spam)
      qc.invalidateQueries({ queryKey: ['activities'], refetchType: 'active' });
      qc.invalidateQueries({ queryKey: qk.activity(id) });
    },
  });
}

/** DELETE: boolean return => optimistic remove + remove detail + optional revalidate */
export function useDeleteActivity({ revalidate = false }: { revalidate?: boolean } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteActivityApi(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['activities'] });

      const pagesSnapshot = snapshotAllActivityPages(qc);
      const prevDetail = qc.getQueryData<Activity>(qk.activity(id));

      // Optimistic remove
      setAllActivityPages(qc, (page) => ({
        ...page,
        data: page.data.filter((a) => a.id !== id),
        total_count: Math.max(0, page.total_count - 1),
      }));

      return { pagesSnapshot, prevDetail, id };
    },

    onError: (_err, _id, ctx) => {
      // Roll back lists
      ctx?.pagesSnapshot?.forEach(({ key, page }) => {
        qc.setQueryData(key, page);
      });
      // Restore detail if we had it
      if (ctx?.prevDetail) qc.setQueryData(qk.activity(ctx.id), ctx.prevDetail);
    },

    onSuccess: (_ok, id) => {
      qc.removeQueries({ queryKey: qk.activity(id) });
      if (revalidate) {
        qc.invalidateQueries({ queryKey: ['activities'], refetchType: 'active' });
      }
    },
  });
}
