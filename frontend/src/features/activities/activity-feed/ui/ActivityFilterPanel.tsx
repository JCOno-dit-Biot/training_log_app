import type { ActivityFilter } from '@entities/activities/model';
import type { Dog } from '@entities/dogs/model';
import type { Runner } from '@entities/runners/model';
import type { Sport } from '@entities/sports/model';

type Props = {
  filters: ActivityFilter;
  setFilters: React.Dispatch<React.SetStateAction<ActivityFilter>>;
  runners: Map<number, Runner>;
  dogs: Map<number, Dog>;
  sports: Map<number, Sport>;
  onApply: () => void;
  onClear: () => void;
};

export default function ActivityFilterPanel({
  filters,
  setFilters,
  runners,
  dogs,
  sports,
  onApply,
  onClear,
}: Props) {
  const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/?d=mp';

  return (
    <div className="space-y-3 text-sm">
      {/* Runner Selector */}
      <div>
        <div className="flex gap-2">
          {[...runners.entries()].map(([id, runner]) => (
            <button
              key={id}
              onClick={() => setFilters((f) => ({ ...f, runner_id: id }))}
              className={`rounded-full border p-1 ${
                filters.runner_id === id ? 'border-blue-500' : 'border-gray-300'
              }`}
            >
              <img
                src={
                  runner?.image_url
                    ? `/profile_picture/runners/${runner.image_url}`
                    : DEFAULT_AVATAR
                }
                alt={runner.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Dog Selector */}
      <div>
        <div className="mt-2 flex gap-2">
          {[...dogs.entries()].map(([id, dog]) => (
            <button
              key={id}
              onClick={() => setFilters((f) => ({ ...f, dog_id: id }))}
              className={`rounded-full border p-1 ${
                filters.dog_id === id ? 'border-blue-500' : 'border-gray-300'
              }`}
            >
              <img
                src={`/profile_picture/dogs/${dog.image_url}`}
                alt={dog.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Sport Dropdown */}
      <div>
        <select
          className="mt-2 w-full rounded border p-2"
          value={filters.sport_id ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              sport_id: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        >
          <option value="">All Sports</option>
          {[...sports.entries()].map(([id, sport]) => (
            <option key={id} value={id}>
              {sport.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date Pickers */}
      <label className="mb-1 block text-sm text-gray-600">Start Date</label>
      <input
        type="date"
        className="w-full rounded border p-2"
        value={filters.start_date ?? ''}
        onChange={(e) =>
          setFilters((f) => ({
            ...f,
            start_date: e.target.value || undefined,
          }))
        }
      />

      <label className="mb-1 block text-sm text-gray-600">End Date</label>
      <input
        type="date"
        className="w-full rounded border p-2"
        value={filters.end_date ?? ''}
        onChange={(e) =>
          setFilters((f) => ({
            ...f,
            end_date: e.target.value || undefined,
          }))
        }
      />
      {/* </div> */}

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <button onClick={onClear} className="rounded border px-4 py-2 text-sm hover:bg-gray-100">
          Clear
        </button>
        <button
          onClick={onApply}
          className="bg-primary hover:bg-opacity-90 rounded px-4 py-2 text-sm text-white"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
