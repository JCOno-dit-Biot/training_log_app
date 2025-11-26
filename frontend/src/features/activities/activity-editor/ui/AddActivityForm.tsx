// components/AddActivityForm.tsx
import { useEffect, useRef, useState } from 'react';

import type { Activity, ActivityForm } from '@entities/activities/model';
import type { WeatherForm } from '@entities/activities/model';
import {
  useCreateActivity,
  useUpdateActivity,
} from '@features/activities/activity-editor/model/useActivitiesMutations';
import { useLocations } from '@features/activities/activity-editor/model/useLocations';
import { useCreateLocation } from '@features/activities/activity-editor/model/useLocations';
import { useDogs } from '@features/dogs/model/useDogs';
import { useRunners } from '@features/runners/model/useRunners';
import { useSports } from '@features/sports/model/useSports';
import { combineLocalDateTimeToUTCISO } from '@/shared/util/dates';

import { activityToPayload, convertToFormData } from '../util/convertToFormData';
import { getActivityChanges } from '../util/getActivityChanges';
import { toPayload } from '../util/toPayload';
import { validateActivityForm } from '../util/validateActivityForm';

import DogSelector from './DogSelector';
import LapEditor from './LapEditor';
import LocationAutocomplete from './LocationAutocomplete';

type AddActivityFormProps = {
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: Activity;
};

const pad2 = (n: number) => n.toString().padStart(2, '0');

export default function AddActivityForm({ onClose, onSuccess, initialData }: AddActivityFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [_error, setError] = useState<string | null>(null);
  const isEdit = !!initialData;

  // form validator
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  // location creation and error handling
  const { mutateAsync: createLoc, isPending: creatingLoc } = useCreateLocation();
  const [banner, setBanner] = useState<{ type: 'success' | 'info' | 'error'; msg: string } | null>(
    null,
  );

  const [formData, setFormData] = useState<ActivityForm>(() =>
    initialData
      ? convertToFormData(initialData)
      : {
        timestamp: new Date().toISOString(),
        runner_id: null,
        sport_id: null,
        dogs: [],
        location_id: null,
        distance: 0,
        speed: undefined,
        pace: '',
        weather: {
          temperature: '',
          humidity: '',
          condition: '',
        },
        workout: false,
        laps: [],
      },
  );

  // inside your component
  const [dateStr, setDateStr] = useState<string>('');
  const [timeStr, setTimeStr] = useState<string>('');

  const { byId: sports } = useSports();
  const { byId: dogs } = useDogs();
  const { byId: runners } = useRunners();
  const { list: locations } = useLocations();

  // create and update hook
  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity({ revalidate: true });

  const saving = createMutation.isPending || updateMutation.isPending || creatingLoc;

  // Initialize from existing timestamp (or now) and keep in sync if formData changes elsewhere
  useEffect(() => {
    const base = formData.timestamp ? new Date(formData.timestamp) : new Date();
    if (!Number.isFinite(base.getTime())) return;

    const y = base.getFullYear();
    const m = base.getMonth() + 1;
    const d = base.getDate();
    const hh = base.getHours();
    const mm = base.getMinutes();

    const newDateStr = `${y}-${pad2(m)}-${pad2(d)}`; // local YYYY-MM-DD
    const newTimeStr = `${pad2(hh)}:${pad2(mm)}`;    // local HH:mm

    setDateStr(newDateStr);
    setTimeStr(newTimeStr);
  }, [formData.timestamp]);

  // Recompute formData.timestamp only when both strings are complete/valid
  useEffect(() => {
    const iso = combineLocalDateTimeToUTCISO(dateStr, timeStr);
    if (iso) {
      setFormData((prev) => ({ ...prev, timestamp: iso }));
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
          temperature: '',
          humidity: '',
          condition: '',
        },
        workout: false,
        laps: [],
      });
    }
  }, [initialData]);

  const handleInputChange = (field: keyof ActivityForm, value: any) => {
    if ((field === 'distance' || field === 'speed') && value !== '') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        setFormData((prev) => ({ ...prev, [field]: parsed }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: '' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleCreateLocation = async (rawName: string) => {
    const name = rawName.trim();
    if (!name) return { ok: false };

    // 1) preflight de-dup using current cache
    const existing = locations.find((l) => l.name.toLowerCase() === name.toLowerCase());
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
      setFormData((prev) => ({ ...prev, pace: value }));
    }
  };

  const handleWeatherChange = <K extends keyof WeatherForm>(
    field: K,
    value: WeatherForm[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      weather: {
        ...prev.weather,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // validate form data
    const errs = validateActivityForm(formData, sports);
    setFieldErrors(errs);

    if (Object.keys(errs).length > 0) {
      setValidationMsg('Please fix the highlighted fields.');
      return; // abort submit
    }
    setValidationMsg(null);
    try {
      if (isEdit && initialData) {
        const original = activityToPayload(initialData);
        const updatedPayload = toPayload(formData);
        const diff = getActivityChanges(original, updatedPayload); // what your API expects
        console.log(diff)
        await updateMutation.mutateAsync({ id: initialData.id, diff });
      } else {
        const payload = toPayload(formData)
        await createMutation.mutateAsync(payload); // returns id inside hook, warms detail, invalidates feed
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
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-charcoal text-xl font-bold">
        {initialData ? 'Edit Activity' : 'Add New Activity'}
      </h2>

      {validationMsg && (
        <div className="mt-2 rounded bg-red-100 px-3 py-2 text-sm text-red-800">
          {validationMsg}
        </div>
      )}
      <div className="mb-2 flex gap-4">
        <div className="flex-1">
          <label htmlFor="date" className="block text-gray-700">
            Date
          </label>
          <input
            id="date"
            type="date"
            className={`w-full rounded border p-2 ${fieldErrors.timestamp ? 'border-red-500' : ''}`}
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)} // no parsing here
            aria-invalid={!!fieldErrors.timestamp}
            aria-describedby={fieldErrors.timestamp ? 'timestamp-error' : undefined}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="time" className="block text-gray-700">
            Time
          </label>
          <input
            id="time"
            type="time"
            className={`w-full rounded border p-2 ${fieldErrors.timestamp ? 'border-red-500' : ''}`}
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)} // no parsing here
            aria-invalid={!!fieldErrors.timestamp}
            aria-describedby={fieldErrors.timestamp ? 'timestamp-error' : undefined}
          />
        </div>
      </div>
      {fieldErrors.timestamp && (
        <p id="timestamp-error" className="mt-1 text-sm text-red-600">
          {fieldErrors.timestamp}
        </p>
      )}

      <div className="mb-2">
        {/* Sport selection dropdown */}
        <label htmlFor="sport" className="block text-gray-700">
          Sport
        </label>
        <select
          id="sport"
          className={`w-full rounded border p-2 ${fieldErrors.sport_id ? 'border-red-500' : ''}`}
          value={formData.sport_id ?? ''}
          onChange={(e) => handleInputChange('sport_id', Number(e.target.value))}
          aria-invalid={!!fieldErrors.sport_id}
          aria-describedby={fieldErrors.sport_id ? 'sport-error' : undefined}
        >
          <option value="">Select Sport</option>
          {[...sports.entries()].map(([id, sport]) => (
            <option key={id} value={id}>
              {sport.name}
            </option>
          ))}
        </select>
        {fieldErrors.sport_id && (
          <p id="sport-error" className="mt-1 text-sm text-red-600">
            {fieldErrors.sport_id}
          </p>
        )}
      </div>
      <div className="mb-2">
        <label htmlFor="runner" className="block text-gray-700">
          Runner
        </label>
        <select
          id="runner"
          className={`w-full rounded border p-2 ${fieldErrors.runner_id ? 'border-red-500' : ''}`}
          value={formData.runner_id ?? ''}
          onChange={(e) => handleInputChange('runner_id', Number(e.target.value))}
          aria-invalid={!!fieldErrors.runner_id}
          aria-describedby={fieldErrors.runner_id ? 'runner-error' : undefined}
        >
          <option value="">Select Runner</option>
          {[...runners.entries()].map(([id, runner]) => (
            <option key={id} value={id}>
              {runner.name}
            </option>
          ))}
        </select>
        {fieldErrors.runner_id && (
          <p id="runner-error" className="mt-1 text-sm text-red-600">
            {fieldErrors.runner_id}
          </p>
        )}
      </div>

      <DogSelector
        selectedDogs={formData.dogs}
        setSelectedDogs={(dogs) => handleInputChange('dogs', dogs)}
        dogs={dogs}
      />
      {fieldErrors.dogs && <p className="mt-1 text-sm text-red-600">{fieldErrors.dogs}</p>}

      <div className="mb-2 flex gap-4">
        <div className="flex-2">
          <label htmlFor="distance" className="block text-gray-700">
            Distance (km)
          </label>
          <input
            id="distance"
            type="number"
            step="0.1"
            className={`w-full rounded border p-2 ${fieldErrors.distance ? 'border-red-500' : ''}`}
            value={formData.distance === 0 ? '' : formData.distance.toString()}
            onChange={(e) => handleInputChange('distance', parseFloat(e.target.value))}
            aria-invalid={!!fieldErrors.distance}
            aria-describedby={fieldErrors.distance ? 'distance-error' : undefined}
          />
          {fieldErrors.distance && (
            <p id="distance-error" className="mt-1 text-sm text-red-600">
              {fieldErrors.distance}
            </p>
          )}
        </div>
        {selectedSport?.display_mode === 'pace' ? (
          <div className="flex-2">
            <label htmlFor="distance" className="block text-gray-700">
              Pace
            </label>
            <input
              id="pace"
              type="text"
              className={`w-full rounded border p-2 ${formData.pace ? 'text-black' : 'text-gray-400'} ${fieldErrors.pace ? 'border-red-500' : ''}`}
              placeholder="MM:SS"
              value={formData.pace}
              onChange={(e) => handlePaceChange(e.target.value)}
              aria-invalid={!!fieldErrors.pace}
              aria-describedby={fieldErrors.pace ? 'pace-error' : undefined}
            />
            {fieldErrors.distance && (
              <p id="pace-error" className="mt-1 text-sm text-red-600">
                {fieldErrors.pace}
              </p>
            )}
          </div>
        ) : (
          <div className="flex-2">
            <label htmlFor="speed" className="block text-gray-700">
              Speed (km/h)
            </label>
            <input
              id="speed"
              type="number"
              step="0.1"
              className={`w-full rounded border p-2 ${fieldErrors.speed ? 'border-red-500' : ''}`}
              value={formData.speed ?? ''}
              onChange={(e) => handleInputChange('speed', parseFloat(e.target.value))}
              aria-invalid={!!fieldErrors.speed}
              aria-describedby={fieldErrors.speed ? 'speed-error' : undefined}
            />
            {fieldErrors.speed && (
              <p id="speed-error" className="mt-1 text-sm text-red-600">
                {fieldErrors.speed}
              </p>
            )}
          </div>
        )}

        <div className="mb-4 flex flex-1 flex-col items-center gap-2">
          <label htmlFor="workout" className="flex-1 font-medium text-gray-700">
            Workout
            <input
              id="workout"
              type="checkbox"
              checked={formData.workout}
              className="peer flex-1 appearance-none"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  workout: e.target.checked,
                  laps: e.target.checked ? [{ lap_number: 0, lap_distance: 0, lap_time: '' }] : [],
                }))
              }
            />
            <span className="peer-checked:bg-success mt-1 ml-1 flex h-8 w-14 flex-shrink-0 items-center rounded-full bg-gray-300 p-1 duration-300 ease-in-out after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow-md after:duration-300 peer-checked:after:translate-x-6"></span>
          </label>
        </div>
      </div>
      {formData.workout && (
        <>
          <LapEditor
            laps={formData.laps}
            setLaps={(laps) => setFormData((prev) => ({ ...prev, laps }))}
          />
          {fieldErrors.laps && (
            <p id="laps-error" className="mt-1 text-sm text-red-600">
              {fieldErrors.laps}
            </p>
          )}
        </>
      )}
      <div className="mb-2">
        <label htmlFor="location" className="block text-gray-700">
          Location
        </label>
        <LocationAutocomplete
          locations={locations}
          value={formData.location_id}
          onChange={(id) => handleInputChange('location_id', id)}
          allowCreateOption
          onCreateNew={handleCreateLocation}
          disabled={creatingLoc}
        />
        {fieldErrors.location_id && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.location_id}</p>
        )}
      </div>
      {banner && (
        <div
          className={`mt-2 rounded px-3 py-2 text-sm ${banner.type === 'success'
            ? 'bg-green-100 text-green-800'
            : banner.type === 'info'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
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
            className="w-full rounded border p-2"
            value={formData.weather?.condition ?? ''}
            onChange={(e) => handleWeatherChange('condition', e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="temperature" className="block text-gray-700">
            T (°C)
          </label>
          <input
            id="temperature"
            type="number"
            className={`w-full rounded border p-2 ${fieldErrors.temperature ? 'border-red-500' : ''}`}
            value={formData.weather?.temperature ?? ''}
            onChange={(e) => handleWeatherChange('temperature', e.target.value)}
            aria-invalid={!!fieldErrors.temperature}
            aria-describedby={fieldErrors.temperature ? 'temperature-error' : undefined}
          />
          {fieldErrors.temperature && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.temperature}</p>
          )}
        </div>
        <div className="flex-1">
          <label htmlFor="humidity" className="block text-gray-700">
            Humidity (%)
          </label>
          <input
            id="humidity"
            type="number"
            step="1"
            className={`w-full rounded border p-2 ${fieldErrors.humidity ? 'border-red-500' : ''}`}
            value={
              formData.weather?.humidity ?? ''
            }
            onChange={(e) => handleWeatherChange('humidity', e.target.value)}
            aria-invalid={!!fieldErrors.humidity}
            aria-describedby={fieldErrors.humidity ? 'humidity-error' : undefined}
          />
          {fieldErrors.humidity && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.humidity}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="bg-primary hover:bg-opacity-90 mt-2 rounded px-4 py-2 text-white"
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Activity'}
      </button>
    </form>
  );
}
