import { ActivityForm } from "../../components/AddActivityForm";
import { Sport } from "../../types/Sport";

const isISO = (s: string) => !Number.isNaN(Date.parse(s));

export function validateActivityForm (
  formData: ActivityForm,
  sports: Map<number, Sport>
):  Record<string, string> {
  const errs: Record<string, string> = {};

  // timestamp required & valid
  if (!formData.timestamp || !isISO(formData.timestamp)) {
    errs.timestamp = "Please pick a valid date and time.";
  }

  // required selects
  if (!formData.sport_id) errs.sport_id = "Please select a sport.";
  if (!formData.runner_id) errs.runner_id = "Please select a runner.";
  if (!formData.location_id) errs.location_id = "Please select a location.";

  // dogs: at least one
  if (!formData.dogs || formData.dogs.length === 0) {
    errs.dogs = "Pick at least one dog.";
  }

  // distance: > 0
  if (!(typeof formData.distance === "number") || formData.distance <= 0) {
    errs.distance = "Distance must be greater than 0.";
  }

  // pace/speed depending on sport display mode
  const sport = formData.sport_id ? sports.get(formData.sport_id) : null;
  if (sport?.display_mode === "pace") {
    // accept MM:SS only for now
    const re = /^\d{1,2}:\d{2}$/;
    if (!formData.pace || !re.test(formData.pace)) {
      errs.pace = "Enter pace as MM:SS (e.g., 04:30).";
    } else {
      const [mm, ss] = formData.pace.split(":").map(Number);
      if (mm === 0 && ss === 0) errs.pace = "Pace cannot be 00:00.";
      if (ss > 59) errs.pace = "Seconds must be between 00–59.";
    }
  } else {
    // speed: > 0 and reasonable cap (tweak as needed)
    if (formData.speed == null || Number.isNaN(formData.speed) || formData.speed <= 0) {
      errs.speed = "Speed must be greater than 0.";
    } else if (formData.speed > 60) {
      errs.speed = "Speed looks too high; please double-check.";
    }
  }

  // workout laps (minimal): at least 1 if workout
  if (formData.workout) {
    if (!formData.laps || formData.laps.length === 0) {
      errs.laps = "Add at least one lap (or untoggle Workout).";
    } else {
      // Basic per-lap check (optional but helpful)
      const bad = formData.laps.find(l => (l.lap_distance ?? 0) < 0 || !l.lap_time);
      if (bad) errs.laps = "Each lap needs a non‑negative distance and a time.";
    }
  }

  // weather checks – optional fields, but if provided must be sane
  // humidity is stored as 0..1; the input shows percentage
  if (formData.weather?.humidity != null && !Number.isNaN(formData.weather.humidity)) {
    if (formData.weather.humidity < 0 || formData.weather.humidity > 1) {
      errs.humidity = "Humidity must be between 0–100%.";
    }
  }

  // temperature sanity (tweak range to your sport context)
  if (formData.weather?.temperature != null && !Number.isNaN(formData.weather.temperature)) {
    const t = formData.weather.temperature;
    if (t < -40 || t > 60) {
      errs.temperature = "Temperature looks unreasonable (try −40 to 60°C).";
    }
  }

  return errs;
};
