import React from 'react';
import { Lap } from '../types/Activity';
import { Trash2 } from 'lucide-react';

interface LapEditorProps {
    laps: Lap[];
    setLaps: (laps: Lap[]) => void;
}

const LapEditor: React.FC<LapEditorProps> = ({ laps, setLaps }) => {
    const handleDistanceChange = (index: number, value: string) => {
        const updated = [...laps];
        updated[index].lap_distance = value === '' ? 0 : parseFloat(value) || 0;
        console.log(laps)
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
        setLaps([...laps, { lap_distance: 0, lap_time: '' }]);
    };

    const removeLap = (index: number) => {
        const updated = laps.filter((_, i) => i !== index);
        setLaps(updated);
    };

    return (
    <div className="mb-6">
      <h3 className="text-md font-semibold text-charcoal mb-3">Workout Laps</h3>

      <div className="grid grid-cols-[80px_1fr_1fr_40px] gap-2 items-center">
        {/* Column headers (only once) */}
        <div></div>
        <div className="text-sm font-medium text-gray-500">Distance</div>
        <div className="text-sm font-medium text-gray-500">Time</div>
        <div></div>

        {/* Lap rows */}
        {laps.map((lap, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center text-sm text-gray-700 h-[40px]">Lap {index + 1}</div>

            <input
              type="number"
              step="0.1"
              className="w-full border rounded p-2 text-sm"
              value={lap.lap_distance != null && lap.lap_distance !== 0 ? lap.lap_distance.toString() : ''}
              onChange={(e) => handleDistanceChange(index, e.target.value)}
            />

            <input
              type="text"
              placeholder="MM:SS"
              className="w-full border rounded p-2 text-sm"
              value={lap.lap_time}
              onChange={(e) => handleTimeChange(index, e.target.value)}
            />

            <div className="flex items-center justify-center h-[40px]">
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
        onClick={addLap}
        className="mt-3 text-sm bg-white text-blue-600 hover:underline"
      >
        + Add Lap
      </button>
    </div>
  );
};

export default LapEditor;