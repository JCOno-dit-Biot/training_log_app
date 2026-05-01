import type { ActivityPayload, DogTemperaturePayload, SelectedDog } from '@entities/activities/model';

function stable(value: unknown) {
  return JSON.stringify(value ?? null);
}

function tempKey(temp: DogTemperaturePayload) {
  return `${temp.phase}:${temp.recovery_minute ?? "null"}`;
}
function getTemperatureChanges(
  originalTemps: DogTemperaturePayload[] = [],
  updatedTemps: DogTemperaturePayload[] = []
): DogTemperaturePayload[] | undefined {
  const originalByKey = new Map(
    originalTemps.map((temp) => [tempKey(temp), temp])
  );

  const changedTemps = updatedTemps.filter((updatedTemp) => {
    const originalTemp = originalByKey.get(tempKey(updatedTemp));
    return stable(originalTemp) !== stable(updatedTemp);
  });

  return changedTemps.length > 0 ? changedTemps : undefined;
}

function getDogChanges(
  originalDogs: SelectedDog[] = [],
  updatedDogs: SelectedDog[] = []
): Partial<SelectedDog>[] | undefined {
  const originalById = new Map(
    originalDogs.map((dog) => [dog.dog_id, dog])
  );

  const dogChanges = updatedDogs
    .map((updatedDog) => {
      const dogIdentifier = updatedDog.dog_id;
      const originalDog = originalById.get(dogIdentifier);

      // New dog: send full dog object
      if (!originalDog) {
        return updatedDog;
      }

      const change: Partial<SelectedDog> = {
        dog_id: updatedDog.dog_id,
      };

      if (originalDog.rating !== updatedDog.rating) {
        change.rating = updatedDog.rating;
      }

      if (stable(originalDog.cooling_method) !== stable(updatedDog.cooling_method)) {
        change.cooling_method = updatedDog.cooling_method;
      }

      const tempChanges = getTemperatureChanges(
        originalDog.temperatures,
        updatedDog.temperatures
      );

      if (tempChanges) {
        change.temperatures = tempChanges;
      }

      const hasActualChanges =
        "rating" in change ||
        "cooling_method" in change ||
        "temperatures" in change;

      return hasActualChanges ? change : null;
    })
    .filter((dog): dog is Partial<SelectedDog> => dog !== null);

  return dogChanges.length > 0 ? dogChanges : undefined;
}

export function getActivityChanges(
  original: ActivityPayload,
  updated: ActivityPayload,
): Partial<ActivityPayload> {
  const changes: Partial<ActivityPayload> = {};

  for (const key in updated) {
    const k = key as keyof ActivityPayload;
    if (k === "dogs") {
      const dogChanges = getDogChanges(original.dogs, updated.dogs);
      if (dogChanges) {
        changes.dogs = dogChanges as ActivityPayload["dogs"];
      }
      continue;
    }

    if (stable(original[k]) !== stable(updated[k])) {
      changes[k] = updated[k];
    }
  }
  console.log(changes)
  return changes;
}
