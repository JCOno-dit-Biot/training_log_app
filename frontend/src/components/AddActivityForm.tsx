// components/AddActivityForm.tsx
import { useState } from "react";

export default function AddActivityForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    runner_id: "",
    dog_ids: [],
    distance: "",
    pace: "",
    sport: "",
    location: "",
    timestamp: new Date().toISOString().slice(0, 16),
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call backend API with formData
    console.log(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-charcoal">Add New Activity</h2>

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
