// src/auth/AfterAuthWarmup.tsx
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { qk } from '../../api/keys';
import { getDogs } from '../../api/dogs';
import { getRunners } from '../../api/runners';
import { getSports } from '../../api/sports';

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
