import { fetchLatest } from '@/entities/dogs/api/weight';
import type { LatestWeight } from '@/entities/dogs/model';
import { qk } from '@/shared/api/keys';

import { useQuery } from '@tanstack/react-query';

export function useLatestAll() {
    return useQuery<LatestWeight[]>({
        queryKey: qk.latestWeights,
        queryFn: () => fetchLatest() as Promise<LatestWeight[]>,
        staleTime: 60_000,
    });
}