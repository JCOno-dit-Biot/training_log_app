import { FunnelIcon } from 'lucide-react';
import { Runner } from '../types/Runner';
import { Dog } from '../types/Dog';
import { Sport } from '../types/Sport';
import { ActivityFilter } from '../types/ActivityFilter';


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
              onClick={() => setFilters(f => ({ ...f, runner_id: id }))}
              className={`rounded-full p-1 border ${
                filters.runner_id === id ? 'border-blue-500' : 'border-gray-300'
              }`}
            >
              <img
                src={runner?.image_url ? `/profile_picture/runners/${runner.image_url}` : DEFAULT_AVATAR}
                alt={runner.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Dog Selector */}
      <div>
        <div className="flex gap-2 mt-2">
          {[...dogs.entries()].map(([id, dog]) => (
            <button
              key={id}
              onClick={() => setFilters(f => ({ ...f, dog_id: id }))}
              className={`rounded-full p-1 border ${
                filters.dog_id === id ? 'border-blue-500' : 'border-gray-300'
              }`}
            >
              <img
                src={`/profile_picture/dogs/${dog.image_url}`}
                alt={dog.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Sport Dropdown */}
      <div>
        <select
          className="w-full mt-2 border rounded p-2"
          value={filters.sport_id ?? ''}
          onChange={(e) =>
            setFilters(f => ({
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
          <label className="block text-sm text-gray-600 mb-1">Start Date</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={filters.start_date ?? ''}
            onChange={e =>
              setFilters(f => ({
                ...f,
                start_date: e.target.value || undefined,
              }))
            }
          />

 
          <label className="block text-sm text-gray-600 mb-1">End Date</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={filters.end_date ?? ''}
            onChange={e =>
              setFilters(f => ({
                ...f,
                end_date: e.target.value || undefined,
              }))
            }
          />
        {/* </div> */}


      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClear}
          className="text-sm px-4 py-2 border rounded hover:bg-gray-100"
        >
          Clear
        </button>
        <button
          onClick={onApply}
          className="text-sm px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
