import { useMemo } from 'react';

import { qk } from '@shared/api/keys';
import { getSports } from '@entities/sports/api/sports';
import type { Sport } from '@entities/sports/model';

import { useQuery } from '@tanstack/react-query';

export function useSports({ enabled = true, staleTime = 2 * 60_000 } = {}) {
  const q = useQuery({
    queryKey: qk.sports(),
    queryFn: getSports,
    enabled,
    staleTime,
    gcTime: 12 * 60 * 60_000,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
  });

  const byId = useMemo(
    () => new Map<number, Sport>((q.data ?? []).map((d) => [d.id, d])),
    [q.data],
  );

  return { ...q, list: q.data ?? [], byId };
}
