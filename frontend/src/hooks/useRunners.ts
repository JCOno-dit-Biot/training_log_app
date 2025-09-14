import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { qk } from '../api/keys';
import { Runner } from '../types/Runner';
import { getRunners } from '../api/runners';

export function useRunners({ enabled = true, staleTime = 5 * 60_000 } = {}) {
  const q = useQuery({
    queryKey: qk.runners(),
    queryFn: getRunners,
    enabled,
    staleTime,
    placeholderData: (prev) => prev
  });

  const byId = useMemo(
    () => new Map<number, Runner>((q.data ?? []).map(d => [d.id, d])),
    [q.data]
  );

  return { ...q, list: q.data ?? [], byId };
}
