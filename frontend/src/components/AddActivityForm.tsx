// components/AddActivityForm.tsx
import { useState } from "react";
import { useGlobalCache } from "../context/GlobalCacheContext";
import DogSelector from "./DogSelector";
import { SelectedDog } from "../types/Dog";
// import { Dog } from "../types/Dog";
// import { Runner } from "../types/Runner";
// import { Weather } from "../types/Weather";
// import { Sport } from "../types/Sport";


interface ActivityForm {
  runner_id: number | null;
  sport_id: number | null;
  dogs: SelectedDog[];
  distance: number;
  speed?: number;
  pace?: string;
  temperature?: number;
  humidity?: number;
  condition?: string;
}

export default function AddActivityForm({ onClose }: { onClose: () => void }) {

  const [formData, setFormData] = useState<ActivityForm>({
    runner_id: null,
    sport_id: null,
    dogs: [],
    distance: 0,
    speed: undefined,
    pace: '',
    temperature: undefined,
    humidity: undefined,
    condition: ''
  });

  const { runners, dogs, sports } = useGlobalCache();

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

  const handlePaceChange = (value: string) => {
    const regex = /^\d{0,2}:?\d{0,2}$/;
    if (value === '' || regex.test(value)) {
      setFormData(prev => ({ ...prev, pace: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call backend API with formData
    console.log(formData);
    onClose();
  };

  const selectedSport = formData.sport_id ? sports.get(formData.sport_id) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-charcoal">Add New Activity</h2>


      <div className="mb-4">
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
      <div className="mb-4">
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

        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <label className="block text-gray-700">Distance (km)</label>
            <input
              type="number"
              step="0.1"
              className="w-full border rounded p-2"
              value={formData.distance}
              onChange={e => handleInputChange('distance', parseFloat(e.target.value))}
            />
          </div>
          {selectedSport?.display_mode === 'pace' ? (
            <div className="flex-1">
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
            <div className="flex-1">
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
          </div>
        
        <div className="mb-4">
          <label className="block text-gray-700">Location</label>
          <input
            type="text"
            className="w-full border rounded p-2" 
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />

          {/* add other fields like sport, runner dropdown, dogs multiselect, etc. */}
        </div>

        <div className="mb-4 flex gap-4">
        <div className="flex-2">
          <label className="block text-gray-700">Conditions</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={formData.condition ?? ''}
            onChange={e => handleInputChange('condition', e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700">T (°C)</label>
          <input
            type="number"
            step="0.1"
            className="w-full border rounded p-2"
            value={formData.temperature ?? ''}
            onChange={e => handleInputChange('temperature', e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700">Humidity (%)</label>
          <input
            type="number"
            step="1"
            className="w-full border rounded p-2"
            value={formData.humidity ?? ''}
            onChange={e => handleInputChange('humidity', e.target.value)}
          />
        </div>
      </div>

        <button type="submit" className="bg-primary text-white py-2 px-4 rounded hover:bg-opacity-90">
          Save Activity
        </button>

    </form>
  );
}
