import React from 'react';
import { Trash2 } from 'lucide-react';

import type { Lap } from '@entities/activities/model';

interface LapEditorProps {
  laps: Lap[];
  setLaps: (laps: Lap[]) => void;
}

const LapEditor: React.FC<LapEditorProps> = ({ laps, setLaps }) => {
  const handleDistanceChange = (index: number, value: string) => {
    const updated = [...laps];
    updated[index].lap_distance = value === '' ? 0 : parseFloat(value) || 0;
    console.log(laps);
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
    const nextLapNumber = laps.length;
    setLaps([...laps, { lap_number: nextLapNumber, lap_distance: 0, lap_time: '' }]);
    console.log(laps);
  };

  const removeLap = (index: number) => {
    const updated = laps
      .filter((_, i) => i !== index)
      .map((lap, i) => ({
        ...lap,
        lap_number: i + 1,
      }));
    setLaps(updated);
    console.log(laps);
  };

  return (
    <div className="mb-6">
      <h3 className="text-md text-charcoal mb-3 font-semibold">Workout Laps</h3>

      <div className="grid grid-cols-[80px_1fr_1fr_40px] items-center gap-2">
        {/* Column headers (only once) */}
        <div></div>
        <div className="text-sm font-medium text-gray-500">Distance</div>
        <div className="text-sm font-medium text-gray-500">Time</div>
        <div></div>

        {/* Lap rows */}
        {laps.map((lap, index) => (
          <React.Fragment key={index}>
            <div className="flex h-[40px] items-center text-sm text-gray-700">Lap {index + 1}</div>

            <input
              type="number"
              step="0.1"
              className="w-full rounded border p-2 text-sm"
              value={
                lap.lap_distance != null && lap.lap_distance !== 0
                  ? lap.lap_distance.toString()
                  : ''
              }
              onChange={(e) => handleDistanceChange(index, e.target.value)}
            />

            <input
              type="text"
              placeholder="MM:SS"
              className="w-full rounded border p-2 text-sm"
              value={lap.lap_time}
              onChange={(e) => handleTimeChange(index, e.target.value)}
            />

            <div className="flex h-[40px] items-center justify-center">
              {laps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLap(index)}
                  className="text-error bg-white hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>

      <button
        type="button"
        onClick={() => addLap()}
        className="mt-3 bg-white text-sm text-blue-600 hover:underline"
      >
        + Add Lap
      </button>
    </div>
  );
};

export default LapEditor;
