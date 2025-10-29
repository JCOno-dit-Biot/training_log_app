import type { ActivityForm } from '@entities/activities/model';

export function getActivityChanges(
  original: ActivityForm,
  updated: ActivityForm,
): Partial<ActivityForm> {
  const changes: Partial<ActivityForm> = {};

  for (const key in original) {
    const k = key as keyof ActivityForm;
    if (JSON.stringify(original[k]) !== JSON.stringify(updated[k])) {
      changes[k] = updated[k];
    }
  }

  return changes;
}
