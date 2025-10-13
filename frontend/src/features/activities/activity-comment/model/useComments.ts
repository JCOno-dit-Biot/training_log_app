import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@shared/api/keys'
import { getComments, postComment, deleteComment, editComment } from '@entities/activities/api/comment';
import { Comment } from '@entities/activities/model';
import { useAuth } from '@app/providers/auth-provider';
import { adjustActivityCommentCount } from '../util/commentCountHelper';

export function useActivityComments(activityId: number, enabled: boolean) {
  const { isAuthenticated } = useAuth();
  const q = useQuery<Comment[]>({
    queryKey: qk.activityComments(activityId),
    queryFn: () => getComments(activityId),
    enabled: isAuthenticated && enabled && !!activityId,
    staleTime: 5 * 60_000,
    refetchOnMount: false,
  });
  return { ...q, list: q.data ?? []}
}


export function useAddComment() {
  const qc = useQueryClient();

  // variables: { activityId, username, text }
  return useMutation<{ id: number }, unknown, { activityId: number; username: string | null; text: string }, { prev?: Comment[]; tempId: number; activityId: number }>({
    mutationFn: ({ activityId, username, text }) =>
      postComment({ activity_id: activityId, username, comment: text } as Comment),

    onMutate: async ({ activityId, username, text }) => {
      await qc.cancelQueries({ queryKey: qk.activityComments(activityId) });

      const prev = qc.getQueryData<Comment[]>(qk.activityComments(activityId));

      const tempId = -Date.now(); // unique negative id
      const optimistic: Comment = {
        id: tempId,
        activity_id: activityId,
        username,
        comment: text,
        created_at: new Date().toISOString(),
      };

      qc.setQueryData<Comment[]>(qk.activityComments(activityId), (old = []) => [...old, optimistic]);

      // bump counts
      adjustActivityCommentCount(qc, activityId, +1);

      return { prev, tempId, activityId };
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      // rollback list
      if (ctx.prev) qc.setQueryData(qk.activityComments(ctx.activityId), ctx.prev);
      // rollback count
      adjustActivityCommentCount(qc, ctx.activityId, -1);
    },

    onSuccess: ({ id }, _vars, ctx) => {
      if (!ctx) return;
      qc.setQueryData<Comment[]>(qk.activityComments(ctx.activityId), (old = []) =>
        old.map(c => (c.id === ctx.tempId ? { ...c, id } : c))
      );
      // no count change here (we already bumped in onMutate)
    },
  });
}

export function useUpdateComment() {
  const qc = useQueryClient();

  return useMutation<{ success: boolean }, unknown, { activityId: number; id: number; text: string; username?: string | null }, { prev?: Comment[]; activityId: number }>({
    mutationFn: ({ activityId, id, text, username }) =>
      editComment(
        activityId,
        id,
        { id, activity_id: activityId, username: username ?? null, comment: text } as Comment
      ),

    onMutate: async ({ activityId, id, text }) => {
      await qc.cancelQueries({ queryKey: qk.activityComments(activityId) });
      const prev = qc.getQueryData<Comment[]>(qk.activityComments(activityId));

      qc.setQueryData<Comment[]>(qk.activityComments(activityId), (old = []) =>
        old.map(c => (c.id === id ? { ...c, comment: text, updated_at: new Date().toISOString() } : c))
      );

      return { prev, activityId };
    },

    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.activityComments(ctx.activityId), ctx.prev);
    },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();

  return useMutation<{ success: boolean }, unknown, { activityId: number; id: number }, { prev?: Comment[]; activityId: number }>({
    mutationFn: ({ activityId, id }) => deleteComment(activityId, id),

    onMutate: async ({ activityId, id }) => {
      await qc.cancelQueries({ queryKey: qk.activityComments(activityId) });
      const prev = qc.getQueryData<Comment[]>(qk.activityComments(activityId));

      qc.setQueryData<Comment[]>(qk.activityComments(activityId), (old = []) =>
        old.filter(c => c.id !== id)
      );
      adjustActivityCommentCount(qc, activityId, -1);

      return { prev, activityId };
    },

    onError: (_e, _vars, ctx) => {
      if (!ctx) return;
      if (ctx.prev) qc.setQueryData(qk.activityComments(ctx.activityId), ctx.prev);
      adjustActivityCommentCount(qc, ctx.activityId, +1);
    },

  });
}