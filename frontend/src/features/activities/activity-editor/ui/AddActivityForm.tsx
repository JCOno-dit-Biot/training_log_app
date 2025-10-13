// components/AddActivityForm.tsx
import { useState, useEffect, useRef } from "react";
import { useDogs } from '@features/dogs/model/useDogs';
import { useRunners } from '@features/runners/model/useRunners';
import { useSports } from '@features/sports/model/useSports';
import { useLocations } from "@features/activities/activity-editor/model/useLocations";

import DogSelector from "./DogSelector";
import LapEditor from './LapEditor';
import LocationAutocomplete from "./LocationAutocomplete";

import { useUpdateActivity, useCreateActivity } from "@features/activities/activity-editor/model/useActivitiesMutations";
import { useCreateLocation } from "@features/activities/activity-editor/model/useLocations";

import { getActivityChanges } from "../util/getActivityChanges";
import { convertToFormData } from "../util/convertToFormData";
import { validateActivityForm } from "../util/validateActivityForm";
import { combineLocalDateTimeToUTCISO } from "@shared/util/combineDateToISO";

import { ActivityForm, Weather, Activity } from "@entities/activities/model";

type AddActivityFormProps = {
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: Activity;
}

export default function AddActivityForm({ onClose, onSuccess, initialData }: AddActivityFormProps) {

  const formRef = useRef<HTMLFormElement>(null);

  const [error, setError] = useState<string | null>(null);
  const isEdit = !!initialData;

  // form validator
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  // location creation and error handling
  const { mutateAsync: createLoc, isPending: creatingLoc } = useCreateLocation();
  const [banner, setBanner] = useState<{ type: "success" | "info" | "error"; msg: string } | null>(null);


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

  // inside your component
  const [dateStr, setDateStr] = useState<string>("");
  const [timeStr, setTimeStr] = useState<string>("");


  const { byId: sports } = useSports();
  const { byId: dogs } = useDogs();
  const { byId: runners } = useRunners();
  const { list: locations } = useLocations();


  // create and update hook
  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity({ revalidate: true })

  const saving = createMutation.isPending || updateMutation.isPending || creatingLoc;

  // Initialize from existing timestamp (or now) and keep in sync if formData changes elsewhere
  useEffect(() => {
    const ts = formData.timestamp ? new Date(formData.timestamp) : new Date();
    if (Number.isFinite(ts.getTime())) {
      setDateStr(ts.toISOString().slice(0, 10));                            // YYYY-MM-DD
      setTimeStr(ts.toLocaleTimeString("en-GB", { hour12: false }).slice(0, 5)); // HH:mm
    }
  }, [formData.timestamp]);

  // Recompute formData.timestamp only when both strings are complete/valid
  useEffect(() => {
    const iso = combineLocalDateTimeToUTCISO(dateStr, timeStr);
    if (iso) {
      setFormData(prev => ({ ...prev, timestamp: iso }));
    }
    // If iso is null, user is mid-edit; DON'T touch formData.timestamp
  }, [dateStr, timeStr, setFormData]);

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

  const handleCreateLocation = async (rawName: string) => {
    const name = rawName.trim();
    if (!name) return { ok: false };

    // 1) preflight de-dup using current cache
    const existing = locations.find(l => l.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      handleInputChange('location_id', existing.id);
      setBanner({ type: 'info', msg: `Selected existing "${existing.name}".` });
      return { ok: true };
    }

    // 2) create with optimistic update
    try {
    const created = await createLoc(name); // resolves to server {id,name}
    handleInputChange('location_id', created.id);
    setBanner({ type: 'success', msg: `Added "${created.name}".` });
    return { ok: true };
  } catch {
    setBanner({ type: 'error', msg: 'Failed to create location.' });
    return { ok: false };
  }
};

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
    setError(null);

    // validate form data
    const errs = validateActivityForm(formData, sports);
    setFieldErrors(errs);

    if (Object.keys(errs).length > 0) {
      setValidationMsg("Please fix the highlighted fields.");
      return; // abort submit
    }
    setValidationMsg(null);
    try {
      if (isEdit && initialData) {
        const original = convertToFormData(initialData);
        const diff = getActivityChanges(original, formData); // what your API expects
        await updateMutation.mutateAsync({ id: initialData.id, diff });
      } else {
        await createMutation.mutateAsync(formData); // returns id inside hook, warms detail, invalidates feed
      }
      onSuccess?.();
      onClose(); // close the modal or reset form as needed
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  const selectedSport = formData.sport_id ? sports.get(formData.sport_id) : null;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-4">
      <h2 className="text-xl font-bold text-charcoal">{initialData ? 'Edit Activity' : 'Add New Activity'}</h2>

      {validationMsg && (
        <div className="mt-2 rounded px-3 py-2 text-sm bg-red-100 text-red-800">
          {validationMsg}
        </div>
      )}
      <div className="mb-2 flex gap-4">
        <div className="flex-1">
          <label htmlFor="date" className="block text-gray-700">Date</label>
          <input
            id="date"
            type="date"
            className={`w-full border rounded p-2 ${fieldErrors.timestamp ? 'border-red-500' : ''}`}
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}   // no parsing here        
            aria-invalid={!!fieldErrors.timestamp}
            aria-describedby={fieldErrors.timestamp ? 'timestamp-error' : undefined}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="time" className="block text-gray-700">Time</label>
          <input
            id="time"
            type="time"
            className={`w-full border rounded p-2 ${fieldErrors.timestamp ? 'border-red-500' : ''}`}
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}   // no parsing here
            aria-invalid={!!fieldErrors.timestamp}
            aria-describedby={fieldErrors.timestamp ? 'timestamp-error' : undefined}
          />
        </div>
        {fieldErrors.timestamp && (
          <p id="timestamp-error" className="text-red-600 text-sm mt-1">
            {fieldErrors.timestamp}
          </p>
        )}

      </div>

      <div className="mb-2">
        {/* Sport selection dropdown */}
        <label htmlFor="sport" className="block text-gray-700">Sport</label>
        <select
          id="sport"
          className={`w-full border rounded p-2 ${fieldErrors.sport_id ? 'border-red-500' : ''}`}
          value={formData.sport_id ?? ''}
          onChange={e => handleInputChange('sport_id', Number(e.target.value))}
          aria-invalid={!!fieldErrors.sport_id}
          aria-describedby={fieldErrors.sport_id ? 'sport-error' : undefined}
        >
          <option value="">Select Sport</option>
          {[...sports.entries()].map(([id, sport]) => (
            <option key={id} value={id}>{sport.name}</option>
          ))}
        </select>
        {fieldErrors.sport_id && (
          <p id="sport-error" className="text-red-600 text-sm mt-1">
            {fieldErrors.sport_id}
          </p>
        )}
      </div>
      <div className="mb-2">
        <label htmlFor="runner" className="block text-gray-700">Runner</label>
        <select
          id="runner"
          className={`w-full border rounded p-2 ${fieldErrors.runner_id ? 'border-red-500' : ''}`}
          value={formData.runner_id ?? ''}
          onChange={e => handleInputChange('runner_id', Number(e.target.value))}
          aria-invalid={!!fieldErrors.runner_id}
          aria-describedby={fieldErrors.runner_id ? 'runner-error' : undefined}
        >
          <option value="">Select Runner</option>
          {[...runners.entries()].map(([id, runner]) => (
            <option key={id} value={id}>{runner.name}</option>
          ))}
        </select>
        {fieldErrors.runner_id && (
          <p id="runner-error" className="text-red-600 text-sm mt-1">
            {fieldErrors.runner_id}
          </p>
        )}
      </div>

      <DogSelector selectedDogs={formData.dogs} setSelectedDogs={(dogs) => handleInputChange('dogs', dogs)} dogs={dogs} />
      {fieldErrors.dogs && <p className="text-red-600 text-sm mt-1">{fieldErrors.dogs}</p>}

      <div className="mb-2 flex gap-4">
        <div className="flex-2">
          <label htmlFor="distance" className="block text-gray-700">Distance (km)</label>
          <input
            id="distance"
            type="number"
            step="0.1"
            className={`w-full border rounded p-2 ${fieldErrors.distance ? 'border-red-500' : ''}`}
            value={formData.distance === 0 ? '' : formData.distance.toString()}
            onChange={(e) => handleInputChange('distance', parseFloat(e.target.value))}
            aria-invalid={!!fieldErrors.distance}
            aria-describedby={fieldErrors.distance ? 'distance-error' : undefined}
          />
          {fieldErrors.distance && (
            <p id="distance-error" className="text-red-600 text-sm mt-1">
              {fieldErrors.distance}
            </p>
          )}
        </div>
        {selectedSport?.display_mode === 'pace' ? (
          <div className="flex-2">
            <label htmlFor="distance" className="block text-gray-700">Pace</label>
            <input
              id="pace"
              type="text"
              className={`w-full border rounded p-2 ${formData.pace ? 'text-black' : 'text-gray-400'} ${fieldErrors.pace ? 'border-red-500' : ''}`}
              placeholder="MM:SS"
              value={formData.pace}
              onChange={e => handlePaceChange(e.target.value)}
              aria-invalid={!!fieldErrors.pace}
              aria-describedby={fieldErrors.pace ? 'pace-error' : undefined}
            />
            {fieldErrors.distance && (
              <p id="pace-error" className="text-red-600 text-sm mt-1">
                {fieldErrors.pace}
              </p>
            )}
          </div>
        ) : (
          <div className="flex-2">
            <label htmlFor="speed" className="block text-gray-700">Speed (km/h)</label>
            <input
              id="speed"
              type="number"
              step="0.1"
              className={`w-full border rounded p-2 ${fieldErrors.speed ? 'border-red-500' : ''}`}
              value={formData.speed ?? ''}
              onChange={e => handleInputChange('speed', parseFloat(e.target.value))}
              aria-invalid={!!fieldErrors.speed}
              aria-describedby={fieldErrors.speed ? 'speed-error' : undefined}
            />
            {fieldErrors.speed && (
              <p id="speed-error" className="text-red-600 text-sm mt-1">
                {fieldErrors.speed}
              </p>
            )}
          </div>
        )}

        <div className="mb-4 flex-1 flex flex-col items-center gap-2">
          <label htmlFor="workout" className="text-gray-700 flex-1 font-medium">Workout
            <input
              id="workout"
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
        <>
          <LapEditor
            laps={formData.laps}
            setLaps={(laps) => setFormData(prev => ({ ...prev, laps }))}
          />
          {fieldErrors.laps && (
            <p id="laps-error" className="text-red-600 text-sm mt-1">
              {fieldErrors.laps}
            </p>
          )}
        </>
      )}
      <div className="mb-2">
        <label htmlFor="location" className="block text-gray-700">Location</label>
        <LocationAutocomplete
          locations={locations}
          value={formData.location_id}
          onChange={id => handleInputChange("location_id", id)}
          allowCreateOption
          onCreateNew={handleCreateLocation}
          disabled={creatingLoc}
        />
        {fieldErrors.location_id && <p className="text-red-600 text-sm mt-1">{fieldErrors.location_id}</p>}
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
          <label htmlFor="temperature" className="block text-gray-700">T (°C)</label>
          <input
            id="temperature"
            type="number"
            step="1"
            className={`w-full border rounded p-2 ${fieldErrors.temperature ? 'border-red-500' : ''}`}
            value={formData.weather?.temperature ?? ''}
            onChange={e => handleWeatherChange('temperature', parseFloat(e.target.value))}
            aria-invalid={!!fieldErrors.temperature}
            aria-describedby={fieldErrors.temperature ? 'temperature-error' : undefined}
          />
          {fieldErrors.temperature && <p className="text-red-600 text-sm mt-1">{fieldErrors.temperature}</p>}
        </div>
        <div className="flex-1">
          <label htmlFor="humidity" className="block text-gray-700">Humidity (%)</label>
          <input
            id="humidity"
            type="number"
            step="1"
            className={`w-full border rounded p-2 ${fieldErrors.humidity ? 'border-red-500' : ''}`}
            value={formData.weather.humidity != null ? (formData.weather.humidity * 100).toFixed(0) : ''}
            onChange={e => handleWeatherChange('humidity', parseFloat(e.target.value))}
            aria-invalid={!!fieldErrors.humidity}
            aria-describedby={fieldErrors.humidity ? 'humidity-error' : undefined}
          />
          {fieldErrors.humidity && <p className="text-red-600 text-sm mt-1">{fieldErrors.humidity}</p>}
        </div>
      </div>

      <button type="submit" className="bg-primary text-white py-2 px-4 mt-2 rounded hover:bg-opacity-90" disabled={saving}>
        {saving ? 'Saving...' : 'Save Activity'}
      </button>

    </form>
  );
}
