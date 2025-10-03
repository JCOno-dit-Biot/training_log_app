import { ActivityFilter } from "../types/Activity";

// define keys for useQuery
export const qk = {
  dogs: () => ['dogs'] as const,
  runners: () => ['runners'] as const,
  sports: () => ['sports'] as const,
  dog: (id: number) => ['dog', id] as const,
  locations: () => ['location'] as const,
  location: (id:number) => ['location', id] as const,
  // Lists are keyed by filters + page/limit so we can page and filter independently
  activities: (filters: ActivityFilter, page: number, limit: number) =>
    ['activities', { filters, page, limit }] as const,
  // Detail
  activity: (id: number) => ['activity', id] as const,
  // Comments per activity
  activityComments: (activityId: number) => ['activity', activityId, 'comments'] as const,
};
