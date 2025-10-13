import { useQuery, usePrefetchQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { qk } from '../api/keys';
import { 
    getActivities, 
    getActivity,
    postActivity as createActivityApi, 
    deleteActivity as deleteActivityApi, 
    updateActivity as updateActivityApi
} from '../api/activities';
import { Activity, ActivityFilter, PaginatedActivities } from '../types/Activity';
import { ActivityForm } from '../types/Activity';
import { useAuth } from '../context/AuthContext';

/** Helpers to touch ALL cached feed pages (any filters/offset/limit currently in cache) */
function snapshotAllActivityPages(qc: ReturnType<typeof useQueryClient>) {
  return qc.getQueriesData<PaginatedActivities>({ queryKey: ['activities'] })
           .map(([key, page]) => ({ key, page }));
}

function setAllActivityPages(
  qc: ReturnType<typeof useQueryClient>,
  mapper: (page: PaginatedActivities) => PaginatedActivities
) {
  qc.getQueriesData<PaginatedActivities>({ queryKey: ['activities'] }).forEach(([key, page]) => {
    if (!page) return;
    qc.setQueryData<PaginatedActivities>(key, mapper(page));
  });
}

export function useActivitiesQuery(
  { limit = 10, offset = 0, filters = {} as ActivityFilter }:
  { limit: number; offset: number; filters?: ActivityFilter }
) {
  const { isAuthenticated } = useAuth();
  const q = useQuery({
    queryKey: qk.activities(filters, limit, offset),
    queryFn: () => getActivities({ limit, offset, filters }),
    enabled: isAuthenticated,
    staleTime: 60_000,       // feeds change often; keep short-ish
    gcTime: 10 * 60_000,
    placeholderData: (prev) => prev, // keep previous page while fetching
    refetchOnMount: false,
  });

  const page = q.data;
  const items = page?.data ?? [];
  const hasPrev = !!page?.previous;
  const hasNext = !!page?.next || ((page?.offset ?? 0) + (page?.limit ?? limit)) < (page?.total_count ?? 0);

  return { ...q, page, items, hasPrev, hasNext };
}

// This is optional to fetch the next offset (snappier load)
export function usePrefetchActivitiesOffset({
  limit = 10,
  offset,
  filters = {},
}: {
  limit?: number;
  offset: number;
  filters?: ActivityFilter;
}) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: qk.activities(filters, limit, offset),
      queryFn: () => getActivities({ limit, offset, filters }),
      staleTime: 60_000,
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