// components/AddActivityForm.tsx
import { useState, useEffect, useCallback } from "react";
import { useGlobalCache } from "../context/GlobalCacheContext";
import DogSelector from "./DogSelector";
import LapEditor from './LapEditor';
import LocationAutocomplete from "./LocationAutocomplete";
import { SelectedDog } from "../types/Dog";
import { Lap } from "../types/Lap";
import { postActivity, updateActivity } from "../api/activities";
import { Weather } from "../types/Weather";
import { Activity, Location } from "../types/Activity"
import { getActivityChanges } from "../functions/helpers/getActivityChanges";
import { getLocations, createLocation } from "../api/locations";
import { convertToFormData } from "../functions/helpers/convertToFormData";


export interface ActivityForm {
  timestamp: string
  runner_id: number | null;
  sport_id: number | null;
  dogs: SelectedDog[];
  distance: number;
  speed?: number;
  pace?: string;
  weather: Weather
  workout: boolean;
  laps: Lap[];
  location_id: number | null;
}

type AddActivityFormProps = {
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: Activity;
}

function upsertLocation(list: { id: number; name: string }[], loc: { id: number; name: string }) {
  const exists = list.some(l => l.id === loc.id);
  return exists ? list : [...list, loc].sort((a, b) => a.name.localeCompare(b.name));
}

export default function AddActivityForm({ onClose, onSuccess, initialData }: AddActivityFormProps) {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!initialData;

  const [creatingLoc, setCreatingLoc] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "info" | "error"; msg: string } | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);

  const [formData, setFormData] = useState<ActivityForm>(() =>
    initialData ? convertToFormData(initialData) : {
      timestamp: new Date().toISOString(),
      runner_id: null,
      sport_id: null,
      dogs: [],
      location_id: null,
      distance: 0,
      speed: undefined,
      pace: '',
      weather: {
        temperature: 0,
        humidity: 0,
        condition: ''
      },
      workout: false,
      laps: []
    }
  );

  const { runners, dogs, sports } = useGlobalCache();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getLocations();
        if (alive) setLocations(data);
      } catch (e) {
        console.error("Failed to fetch locations", e);
        if (alive) setLocations([]);
      }
    })();
    return () => { alive = false };
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(convertToFormData(initialData));
    } else {
      setFormData({
        timestamp: new Date().toISOString(),
        runner_id: null,
        sport_id: null,
        dogs: [],
        location_id: null,
        distance: 0,
        speed: undefined,
        pace: '',
        weather: {
          temperature: 0,
          humidity: 0,
          condition: ''
        },
        workout: false,
        laps: []
      });
    }
  }, [initialData]);

  const handleInputChange = (field: keyof ActivityForm, value: any) => {
    if ((field === 'distance' || field === 'speed') && value !== '') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        setFormData(prev => ({ ...prev, [field]: parsed }));
      } else {
        setFormData(prev => ({ ...prev, [field]: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };


  const handleCreateLocation = useCallback(async (rawName: string) => {
    const name = rawName.trim();
    if (!name) return;


    setCreatingLoc(true);
    try {
      const created = await createLocation(name);
      setLocations(prev => upsertLocation(prev, created));
      handleInputChange("location_id", created.id);
      setBanner({ type: "success", msg: `Added "${created.name}".` });
      return { ok: true }
    } catch (err: any) {
      if (err?.response?.status === 409) {
        // pick existing if present locally
        const existing = locations.find(l => l.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          handleInputChange("location_id", existing.id);
          setBanner({ type: "info", msg: `Selected existing "${existing.name}".` });
          return { ok: true }
        }
        // if not cached, just inform; user can type to find
        setBanner({ type: "info", msg: `Location already exists. Please select it.` });
        return { ok: false };
      }
      setBanner({ type: "error", msg: "Failed to create location." });
      return { ok: false };
    }
  }, [locations, handleInputChange]);


  const handlePaceChange = (value: string) => {
    const regex = /^\d{0,2}:?\d{0,2}$/;
    if (value === '' || regex.test(value)) {
      setFormData(prev => ({ ...prev, pace: value }));
    }
  };

  const handleWeatherChange = (field: keyof Weather, value: any) => {
    const parsedValue = field === 'humidity'
      ? (parseFloat(value) / 100)
      : value;

    setFormData(prev => ({
      ...prev,
      weather: {
        ...prev.weather,
        [field]: parsedValue
      }
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // TODO: Call backend API with formData
    try {
      if (isEdit && initialData) {
        const original = convertToFormData(initialData);
        const changes = getActivityChanges(original, formData);
        await updateActivity(initialData.id, changes);
      } else {
        const response = await postActivity(formData);
      }
      onSuccess?.();
      onClose(); // close the modal or reset form as needed
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const selectedSport = formData.sport_id ? sports.get(formData.sport_id) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-charcoal">{initialData ? 'Edit Activity' : 'Add New Activity'}</h2>

      <div className="mb-2 flex gap-4">
        <div className="flex-1">
          <label className="block text-gray-700">Date</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={new Date(formData.timestamp).toISOString().split('T')[0]}
            onChange={(e) => {
              const time = new Date(formData.timestamp).toISOString().split('T')[1]; // keep current time
              const combined = new Date(`${e.target.value}T${time}`);
              setFormData(prev => ({ ...prev, timestamp: combined.toISOString() }));
            }}
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700">Time</label>
          <input
            type="time"
            className="w-full border rounded p-2"
            value={new Date(formData.timestamp).toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5)}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':').map(Number);
              const date = new Date(formData.timestamp);
              date.setHours(hours);
              date.setMinutes(minutes);
              setFormData(prev => ({ ...prev, timestamp: date.toISOString() }));
            }}
          />
        </div>
      </div>

      <div className="mb-2">
        {/* Sport selection dropdown */}
        <label className="block text-gray-700">Sport</label>
        <select
          className="w-full border rounded p-2"
          value={formData.sport_id ?? ''}
          onChange={e => handleInputChange('sport_id', Number(e.target.value))}
        >
          <option value="">Select Sport</option>
          {[...sports.entries()].map(([id, sport]) => (
            <option key={id} value={id}>{sport.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label className="block text-gray-700">Runner</label>
        <select
          className="w-full border rounded p-2"
          value={formData.runner_id ?? ''}
          onChange={e => handleInputChange('runner_id', Number(e.target.value))}
        >
          <option value="">Select Runner</option>
          {[...runners.entries()].map(([id, runner]) => (
            <option key={id} value={id}>{runner.name}</option>
          ))}
        </select>
      </div>

      <DogSelector selectedDogs={formData.dogs} setSelectedDogs={(dogs) => handleInputChange('dogs', dogs)} dogs={dogs} />

      <div className="mb-2 flex gap-4">
        <div className="flex-2">
          <label className="block text-gray-700">Distance (km)</label>
          <input
            type="number"
            step="0.1"
            className="w-full border rounded p-2"
            value={formData.distance === 0 ? '' : formData.distance.toString()}
            onChange={e => handleInputChange('distance', parseFloat(e.target.value))}
          />
        </div>
        {selectedSport?.display_mode === 'pace' ? (
          <div className="flex-2">
            <label className="block text-gray-700">Pace</label>
            <input
              type="text"
              className={`w-full border rounded p-2 ${formData.pace ? 'text-black' : 'text-gray-400'}`}
              placeholder="MM:SS"
              value={formData.pace}
              onChange={e => handlePaceChange(e.target.value)}
            />
          </div>
        ) : (
          <div className="flex-2">
            <label className="block text-gray-700">Speed (km/h)</label>
            <input
              type="number"
              step="0.1"
              className="w-full border rounded p-2"
              value={formData.speed ?? ''}
              onChange={e => handleInputChange('speed', parseFloat(e.target.value))}
            />
          </div>
        )}

        <div className="mb-4 flex-1 flex flex-col items-center gap-2">
          <label className="text-gray-700 flex-1 font-medium">Workout
            <input
              type="checkbox"
              checked={formData.workout}
              className="flex-1 peer appearance-none "
              onChange={(e) => setFormData(prev => ({
                ...prev,
                workout: e.target.checked,
                laps: e.target.checked ? [{ lap_number: 0, lap_distance: 0, lap_time: '' }] : [],
              }))}
            />
            <span className="w-14 h-8 flex items-center flex-shrink-0 ml-1 mt-1 p-1 bg-gray-300 rounded-full duration-300 ease-in-out peer-checked:bg-success after:w-6 after:h-6 after:bg-white after:rounded-full after:shadow-md after:duration-300 peer-checked:after:translate-x-6"></span>
          </label>
        </div>
      </div>
      {formData.workout && (
        <LapEditor
          laps={formData.laps}
          setLaps={(laps) => setFormData(prev => ({ ...prev, laps }))}
        />
      )}
      <div className="mb-2">
        <label className="block text-gray-700">Location</label>
        <LocationAutocomplete
          locations={locations}
          value={formData.location_id}
          onChange={id => handleInputChange("location_id", id)}
          allowCreateOption
          onCreateNew={handleCreateLocation}
          disabled={creatingLoc}
        />
      </div>
      {banner && (
        <div
          className={`mt-2 rounded px-3 py-2 text-sm ${banner.type === "success" ? "bg-green-100 text-green-800" :
              banner.type === "info" ? "bg-blue-100 text-blue-800" :
                "bg-red-100 text-red-800"
            }`}
        >
          {banner.msg}
        </div>
      )}


      <div className="mb-2 flex gap-4">
        <div className="flex-2">
          <label className="block text-gray-700">Conditions</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={formData.weather?.condition ?? ''}
            onChange={e => handleWeatherChange('condition', e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700">T (°C)</label>
          <input
            type="number"
            step="0.1"
            className="w-full border rounded p-2"
            value={formData.weather?.temperature ?? ''}
            onChange={e => handleWeatherChange('temperature', parseFloat(e.target.value))}
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700">Humidity (%)</label>
          <input
            type="number"
            step="1"
            className="w-full border rounded p-2"
            value={formData.weather.humidity != null ? (formData.weather.humidity * 100).toFixed(0) : ''}
            onChange={e => handleWeatherChange('humidity', parseFloat(e.target.value))}
          />
        </div>
      </div>

      <button type="submit" className="bg-primary text-white py-2 px-4 mt-2 rounded hover:bg-opacity-90" disabled={loading}>
        {loading ? 'Saving...' : 'Save Activity'}
      </button>

    </form>
  );
}
