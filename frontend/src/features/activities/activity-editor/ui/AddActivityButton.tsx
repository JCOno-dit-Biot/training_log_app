// components/AddActivityButton.tsx
import { Plus } from 'lucide-react';

export default function AddActivityButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-primary text-cream hover:bg-opacity-90 fixed right-[380px] bottom-10 z-50 rounded-full p-4 shadow-lg"
      aria-label="Add Activity"
    >
      <Plus size={30} />
    </button>
  );
}
