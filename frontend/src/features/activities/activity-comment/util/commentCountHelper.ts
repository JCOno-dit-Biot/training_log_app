 import type { Activity, PaginatedActivities } from "@entities/activities/model";
 import { QueryClient } from '@tanstack/react-query';
 import { qk } from "@shared/api/keys";


 export function adjustActivityCommentCount(
  qc: QueryClient,
  activityId: number,
  delta: number
) {
  // detail
  const detail = qc.getQueryData<Activity>(qk.activity(activityId));
  if (detail) {
    qc.setQueryData<Activity>(qk.activity(activityId), {
      ...detail,
      comment_count: Math.max(0, (detail.comment_count ?? 0) + delta),
    });
  }

  // all cached list pages
  qc.getQueriesData<PaginatedActivities>({ queryKey: ['activities'] })
    .forEach(([key, page]) => {
      if (!page) return;
      qc.setQueryData<PaginatedActivities>(key, {
        ...page,
        data: page.data.map(a =>
          a.id === activityId
            ? { ...a, comment_count: Math.max(0, (a.comment_count ?? 0) + delta) }
            : a
        ),
      });
    });
}