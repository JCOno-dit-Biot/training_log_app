import { Plus, SlidersHorizontal } from "lucide-react";

type ActivityHeaderProps = {
  onOpenCreate: () => void;  // opens your existing "create activity" modal
  onOpenFilter: () => void;  // opens your filter UI (sheet/modal)
  className?: string;
};

export function ActivityHeader({ onOpenCreate, onOpenFilter, className = "" }: ActivityHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-40 background-blur ${className}`}
      role="region"
      aria-label="Activity header"  
    >
      <div className="h-14 flex items-center">
        {/* 3-column responsive grid: left button / centered title / right button(s) */}
        <div className="grid grid-cols-3 items-center w-full">
          {/* Left: Add new activity */}
          <div className="flex items-center">
            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-cream px-3.5 py-2 shadow hover:shadow-md active:scale-[.98] transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add new activity</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {/* Center: title */}
          <div className="flex justify-center">
            <h2 className="text-xl font-semibold text-charcoal">
              Recent activity
            </h2>
          </div>

          {/* Right: Filter */}
          <div className="flex justify-end">
            <button
              onClick={onOpenFilter}
              className="inline-flex items-center gap-2 px-4 py-2 border border-stone rounded hover:bg-gray-100"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
