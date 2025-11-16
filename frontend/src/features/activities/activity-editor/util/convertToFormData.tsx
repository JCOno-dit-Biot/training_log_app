import type { Activity, ActivityForm } from '@entities/activities/model';

export function convertToFormData(activity: Activity): ActivityForm {
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
      temperature: activity.weather.temperature,
      humidity: activity.weather.humidity,
      condition: activity.weather.condition,
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
