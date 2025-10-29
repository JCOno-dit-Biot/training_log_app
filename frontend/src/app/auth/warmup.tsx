// src/auth/AfterAuthWarmup.tsx
import { useEffect } from 'react';

import { qk } from '@shared/api/keys';
import { getDogs } from '@entities/dogs/api/dogs';
import { getRunners } from '@entities/runners/api/runners';
import { getSports } from '@entities/sports/api/sports';

import { useAuth } from '../providers/auth-provider';

import { useQueryClient } from '@tanstack/react-query';

export function AfterAuthWarmup() {
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return;
    qc.prefetchQuery({ queryKey: qk.dogs(), queryFn: getDogs, staleTime: 5 * 60_000 });
    qc.prefetchQuery({ queryKey: qk.runners(), queryFn: getRunners, staleTime: 10 * 60_000 });
    qc.prefetchQuery({ queryKey: qk.sports(), queryFn: getSports, staleTime: 60 * 60_000 });
  }, [isAuthenticated, qc]);

  return null;
}
