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