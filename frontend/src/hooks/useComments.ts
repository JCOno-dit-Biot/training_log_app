import { useQuery } from '@tanstack/react-query';
import { qk } from '../api/keys';
import { getComments } from '../api/comment';
import { Comment } from '../types/Comment';
import { useAuth } from '../context/AuthContext';


export function useActivityComments(activityId: number, enabled: boolean) {
  const { isAuthenticated } = useAuth();
  return useQuery<Comment[]>({
    queryKey: qk.activityComments(activityId),
    queryFn: () => getComments(activityId),
    enabled: isAuthenticated && enabled && !!activityId,
    staleTime: 5 * 60_000,
    refetchOnMount: false,
  });
}