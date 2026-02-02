import { useEffect, useState } from 'react';
import { Plus, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/shared/ui/button';

type ActivityHeaderProps = {
  onOpenCreate: () => void; // opens your existing "create activity" modal
  onOpenFilter: () => void; // opens your filter UI (sheet/modal)
  className?: string;
};

export function ActivityHeader({
  onOpenCreate,
  onOpenFilter,
  className = '',
}: ActivityHeaderProps) {
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const handler = () => setAtTop(window.scrollY === 0);
    handler(); // run once on mount
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-200 ${atTop
        ? 'bg-neutral-25' // solid when at top
        : 'bg-neutral-25/70 backdrop-blur supports-[backdrop-filter]:bg-neutral-25/60'
        } ${className}`}
      role="region"
      aria-label="Activity header"
    >
      <div className="flex h-14 items-center">
        {/* 3-column responsive grid: left button / centered title / right button(s) */}
        <div className="grid w-full grid-cols-3 items-center">
          {/* Left: Add new activity */}
          <div className="flex items-center">
            <Button
              onClick={onOpenCreate}
              variant="default"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add new activity</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>

          {/* Center: title */}
          <div className="flex justify-center">
            <h2 className="text-charcoal text-xl font-semibold">Recent activity</h2>
          </div>

          {/* Right: Filter */}
          <div className="flex justify-end">
            <Button
              onClick={onOpenFilter}
              variant="default"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
