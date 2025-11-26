import type { ActivityPayload } from '@entities/activities/model';

export function getActivityChanges(
  original: ActivityPayload,
  updated: ActivityPayload,
): Partial<ActivityPayload> {
  const changes: Partial<ActivityPayload> = {};

  for (const key in original) {
    const k = key as keyof ActivityPayload;
    if (JSON.stringify(original[k]) !== JSON.stringify(updated[k])) {
      changes[k] = updated[k];
    }
  }

  return changes;
}
