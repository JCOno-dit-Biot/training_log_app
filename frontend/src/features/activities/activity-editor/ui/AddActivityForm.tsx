// components/AddActivityForm.tsx
import { useEffect, useState } from 'react';

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
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { combineLocalDateTimeToUTCISO } from '@/shared/util/dates';

import { activityToPayload, convertToFormData } from '../util/convertToFormData';
import { getActivityChanges } from '../util/getActivityChanges';
import { toPayload } from '../util/toPayload';
import { validateActivityForm } from '../util/validateActivityForm';

import DogSelector from './DogSelector';
import LapEditor from './LapEditor';
import { LocationCombobox } from './LocationCombobox';

type AddActivityFormProps = {
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: Activity;
};

const pad2 = (n: number) => n.toString().padStart(2, '0');

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-destructive">{msg}</p>;
}

export default function AddActivityForm({ onClose, onSuccess, initialData }: AddActivityFormProps) {


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
  const { byId: locationsById, list: locationsList } = useLocations();

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
    } else if (field === 'location_id') {
      setFormData((prev) => ({ ...prev, location_id: value ?? null }));
    }
    else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleCreateLocation = async (rawName: string) => {
    const name = rawName.trim();
    if (!name) return { ok: false };

    // 1) preflight de-dup using current cache
    const existing = locationsList.find((l) => l.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      handleInputChange('location_id', existing.id);
      setBanner({ type: 'info', msg: `Selected existing "${existing.name}".` });
      return { ok: true };
    }

    // 2) create with optimistic update
    try {
      const created = await createLoc({ name: name }); // resolves to server {id,name}
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

  const bannerVariant = banner?.type === "success" ? "default" : banner?.type === "info" ? "default" : "destructive";

  return (
    <Card className="w-full max-w-2xl border-none bg-card/0">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-0">
          {validationMsg && (
            <Alert variant="destructive">
              <AlertTitle>Please fix the highlighted fields</AlertTitle>
            </Alert>
          )}

          {banner && (
            <Alert variant={bannerVariant}>
              <AlertDescription>{banner.msg}</AlertDescription>
            </Alert>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                aria-invalid={!!fieldErrors.timestamp}
              />
              <FieldError msg={fieldErrors.timestamp} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                aria-invalid={!!fieldErrors.timestamp}
              />
            </div>
          </div>

          {/* Sport */}
          <div className="space-y-2">
            <Label>Sport</Label>
            <Select
              value={formData.sport_id ? String(formData.sport_id) : ""}
              onValueChange={(v) => handleInputChange("sport_id", v ? Number(v) : null)}
            >
              <SelectTrigger aria-invalid={!!fieldErrors.sport_id}>
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>
              <SelectContent>
                {[...sports.entries()].map(([id, sport]) => (
                  <SelectItem key={id} value={String(id)}>
                    {sport.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError msg={fieldErrors.sport_id} />
          </div>

          {/* Runner */}
          <div className="space-y-2">
            <Label>Runner</Label>
            <Select
              value={formData.runner_id ? String(formData.runner_id) : ""}
              onValueChange={(v) => handleInputChange("runner_id", v ? Number(v) : null)}
            >
              <SelectTrigger aria-invalid={!!fieldErrors.runner_id}>
                <SelectValue placeholder="Select runner" />
              </SelectTrigger>
              <SelectContent>
                {[...runners.entries()].map(([id, runner]) => (
                  <SelectItem key={id} value={String(id)}>
                    {runner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError msg={fieldErrors.runner_id} />
          </div>

          {/* Dogs */}
          <div className="space-y-2">
            <DogSelector
              selectedDogs={formData.dogs}
              setSelectedDogs={(next) => handleInputChange("dogs", next)}
              dogs={dogs}
            />
            <FieldError msg={fieldErrors.dogs} />
          </div>

          {/* Distance / Speed or Pace */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                value={formData.distance === 0 ? "" : String(formData.distance)}
                onChange={(e) => handleInputChange("distance", e.target.value)}
                aria-invalid={!!fieldErrors.distance}
              />
              <FieldError msg={fieldErrors.distance} />
            </div>

            {selectedSport?.display_mode === "pace" ? (
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="pace">Pace</Label>
                <Input
                  id="pace"
                  type="text"
                  placeholder="MM:SS"
                  value={formData.pace}
                  onChange={(e) => handlePaceChange(e.target.value)}
                  aria-invalid={!!fieldErrors.pace}
                />
                <FieldError msg={fieldErrors.pace} />
              </div>
            ) : (
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="speed">Speed (km/h)</Label>
                <Input
                  id="speed"
                  type="number"
                  step="0.1"
                  value={formData.speed ?? ""}
                  onChange={(e) => handleInputChange("speed", e.target.value)}
                  aria-invalid={!!fieldErrors.speed}
                />
                <FieldError msg={fieldErrors.speed} />
              </div>
            )}

            <div className="flex items-center justify-between rounded-md border p-3 sm:col-span-1">
              <div className="space-y-0.5">
                <Label htmlFor="workout" className="text-sm">
                  Workout
                </Label>
                <p className="text-xs text-muted-foreground">Enable laps editor</p>
              </div>
              <Switch
                id="workout"
                checked={formData.workout}
                onCheckedChange={(checked) => {
                  setFormData((prev) => ({
                    ...prev,
                    workout: checked,
                    laps: checked ? [{ lap_number: 0, lap_distance: 0, lap_time: "" }] : [],
                  }));
                }}
              />
            </div>
          </div>

          {formData.workout && (
            <div className="space-y-2">
              <LapEditor
                laps={formData.laps}
                setLaps={(laps) => setFormData((prev) => ({ ...prev, laps }))}
              />
              <FieldError msg={fieldErrors.laps} />
            </div>
          )}

          {/* Location */}
          <div className="space-y-2">
            <Label>Location</Label>
            <LocationCombobox
              locations={locationsById} // Map
              value={formData.location_id ?? null}
              onChange={(id) => handleInputChange("location_id", id)}
              allowCreateOption
              onCreateNew={handleCreateLocation}
              disabled={creatingLoc}
            />
            <FieldError msg={fieldErrors.location_id} />
          </div>

          {/* Weather */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-1">
                <Label>Conditions</Label>
                <Input
                  type="text"
                  value={formData.weather?.condition ?? ""}
                  onChange={(e) => handleWeatherChange("condition", e.target.value)}
                />
              </div>

              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="temperature">T (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  value={formData.weather?.temperature ?? ""}
                  onChange={(e) => handleWeatherChange("temperature", e.target.value)}
                  aria-invalid={!!fieldErrors.temperature}
                />
                <FieldError msg={fieldErrors.temperature} />
              </div>

              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="humidity">Humidity (%)</Label>
                <Input
                  id="humidity"
                  type="number"
                  step="1"
                  value={formData.weather?.humidity ?? ""}
                  onChange={(e) => handleWeatherChange("humidity", e.target.value)}
                  aria-invalid={!!fieldErrors.humidity}
                />
                <FieldError msg={fieldErrors.humidity} />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Activity"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}