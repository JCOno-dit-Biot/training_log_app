import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { qk } from '@shared/api/keys';
import { Runner } from '@entities/runners/model';
import { getRunners } from '@entities/runners/api/runners';

export function useRunners({ enabled = true, staleTime = 2 * 60 * 60_000 } = {}) {
  const q = useQuery({
    queryKey: qk.runners(),
    queryFn: getRunners,
    enabled,
    staleTime,
    gcTime: 12 * 60 *60_000,
    refetchOnMount: false,
    placeholderData: (prev) => prev
  });

  const byId = useMemo(
    () => new Map<number, Runner>((q.data ?? []).map(d => [d.id, d])),
    [q.data]
  );

  return { ...q, list: q.data ?? [], byId };
}
