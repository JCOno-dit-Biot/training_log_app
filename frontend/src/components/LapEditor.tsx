import React from 'react';
import { Lap } from '../types/Activity';

interface LapEditorProps {
  laps: Lap[];
  setLaps: (laps: Lap[]) => void;
}

const LapEditor: React.FC<LapEditorProps> = ({ laps, setLaps }) => {
  const handleDistanceChange = (index: number, value: string) => {
    const updated = [...laps];
    updated[index].distance = parseFloat(value) || 0;
    setLaps(updated);
  };

  const handleTimeChange = (index: number, value: string) => {
    const regex = /^\d{0,2}:?\d{0,2}$/;
    if (value === '' || regex.test(value)) {
      const updated = [...laps];
      updated[index].lap_time = value;
      setLaps(updated);
    }
  };

  const addLap = () => {
    setLaps([...laps, { distance: 0, lap_time: '' }]);
  };

  const removeLap = (index: number) => {
    const updated = laps.filter((_, i) => i !== index);
    setLaps(updated);
  };

  return (
    <div className="mb-6">
      <h3 className="text-md font-semibold text-charcoal mb-2">Workout Laps</h3>
      {laps.map((lap, index) => (
        <div key={index} className="flex gap-4 mb-2 items-end">
          <div className="flex-1">
            <label className="block text-gray-700 text-sm">Lap {index + 1} Distance (km)</label>
            <input
              type="number"
              step="0.1"
              className="w-full border rounded p-2"
              value={lap.distance}
              onChange={e => handleDistanceChange(index, e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 text-sm">Lap Time (MM:SS)</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              placeholder="MM:SS"
              value={lap.lap_time}
              onChange={e => handleTimeChange(index, e.target.value)}
            />
          </div>
          {laps.length > 1 && (
            <button
              type="button"
              className="text-sm text-red-600 hover:underline"
              onClick={() => removeLap(index)}
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        className="mt-2 text-sm text-blue-600 hover:underline"
        onClick={addLap}
      >
        + Add Lap
      </button>
    </div>
  );
};

export default LapEditor;
