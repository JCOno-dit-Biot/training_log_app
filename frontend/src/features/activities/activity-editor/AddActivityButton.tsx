// components/AddActivityButton.tsx
import { Plus } from "lucide-react";

export default function AddActivityButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-10 right-[380px] bg-primary text-cream p-4 rounded-full shadow-lg hover:bg-opacity-90 z-50"
      aria-label="Add Activity"
    >
      <Plus size={30} />
    </button>
  );
}
