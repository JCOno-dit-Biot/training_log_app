
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDogs} from '../api/dogs';
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
