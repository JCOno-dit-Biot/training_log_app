import type { Activity, ActivityDogTemperature, ActivityForm, ActivityHeatData, ActivityPayload } from '@entities/activities/model';

export function convertToFormData(
  activity: Activity,
  heatData?: ActivityHeatData | null
): ActivityForm {
  const heatByDogId = new Map(
    heatData?.dogs.map((dog) => [dog.dog_id, dog]) ?? []
  );

  const getTemp = (
    temps: ActivityDogTemperature[] | undefined,
    phase: "before" | "after" | "recovery"
  ) => temps?.find((t) => t.phase === phase);


  return {
    timestamp: activity.timestamp,
    runner_id: activity.runner.id,
    sport_id: activity.sport.id,
    dogs: activity.dogs.map((d) => {
      const dogId = d.dog.id;
      const heatDog = heatByDogId.get(dogId);
      const before = getTemp(heatDog?.temperatures, "before");
      const after = getTemp(heatDog?.temperatures, "after");
      const recovery = getTemp(heatDog?.temperatures, "recovery");

      return {
        id: heatDog?.activity_dog_id,
        dog_id: dogId,
        rating: d.rating,

        cooling_method: heatDog?.cooling_method ?? "",
        measurement_method:
          before?.measurement_method ??
          after?.measurement_method ??
          recovery?.measurement_method ??
          "ear",

        temperature_before:
          before?.temperature_c == null ? "" : String(before.temperature_c),
        temperature_after:
          after?.temperature_c == null ? "" : String(after.temperature_c),
        temperature_recovery:
          recovery?.temperature_c == null ? "" : String(recovery.temperature_c),
        recovery_minute:
          recovery?.recovery_minute == null ? "" : String(recovery.recovery_minute),
      };
    }),
    distance: activity.distance,
    speed: activity.speed,
    pace: activity.pace,
    weather: {
      temperature: activity.weather?.temperature == null ? '' : String(activity.weather.temperature),
      humidity: activity.weather?.humidity == null ? '' : String(activity.weather?.humidity * 100),
      condition: activity.weather?.condition ?? "",
    },
    location_id: activity.location.id,
    workout: activity.workout,
    laps: activity.laps.map((lap) => ({
      lap_number: lap.lap_number,
      lap_distance: lap.lap_distance,
      lap_time: lap.lap_time,
    })),
  };
}

export function activityToPayload(activity: Activity): ActivityPayload {
  return {
    timestamp: activity.timestamp,
    runner_id: activity.runner.id,
    sport_id: activity.sport.id,
    dogs: activity.dogs.map((d) => ({
      dog_id: d.dog.id,
      rating: d.rating,
    })),
    distance: activity.distance,
    speed: activity.speed,
    pace: activity.pace,
    weather: {
      temperature: activity.weather?.temperature ?? null,
      humidity: activity.weather?.humidity ?? null,
      condition: activity.weather?.condition ?? null,
    },
    location_id: activity.location.id,
    workout: activity.workout,
    laps: activity.laps.map((lap) => ({
      lap_number: lap.lap_number,
      lap_distance: lap.lap_distance,
      lap_time: lap.lap_time,
    })),
  };
}