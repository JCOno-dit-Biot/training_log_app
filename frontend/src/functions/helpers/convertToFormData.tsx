import { Activity } from "../../types/Activity";
import { ActivityForm } from "../../components/AddActivityForm";
import { SelectedDog } from "../../types/Dog";


export function convertToFormData(activity: Activity): ActivityForm {
  return {
    timestamp: activity.timestamp,
    runner_id: activity.runner.id,
    sport_id: activity.sport.id,
    dogs: activity.dogs.map(d => ({
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
    location: activity.location,
    workout: activity.workout,
    laps: activity.laps || [],
  };
}
