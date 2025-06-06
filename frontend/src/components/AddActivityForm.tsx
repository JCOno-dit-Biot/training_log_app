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

  const {runners, dogs} = useGlobalCache();

  const handleInputChange = (field: keyof ActivityForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call backend API with formData
    console.log(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-charcoal">Add New Activity</h2>

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

        <DogSelector selectedDogs={formData.dogs} setSelectedDogs={(dogs) => handleInputChange('dogs', dogs)} dogs={dogs} />

      <div className="mb-4">
        <label className="block text-gray-700">Distance (km)</label>
        <input
          type="number"
          className="w-full border rounded p-2"
          value={formData.distance}
          onChange={e => handleInputChange('distance', Number(e.target.value))}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Speed (km/h)</label>
        <input
          type="number"
          className="w-full border rounded p-2"
          value={formData.speed ?? ''}
          onChange={e => handleInputChange('speed', Number(e.target.value))}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Pace</label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={formData.pace ?? ''}
          onChange={e => handleInputChange('pace', e.target.value)}
        />
      </div>

      </div>
        <input
            type="text"
            placeholder="Location"
            className="input"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />

      {/* add other fields like sport, runner dropdown, dogs multiselect, etc. */}

      <button type="submit" className="bg-primary text-white py-2 px-4 rounded hover:bg-opacity-90">
        Save Activity
      </button>
    </form>
  );
}
