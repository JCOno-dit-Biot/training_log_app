import { Plus, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

type ActivityHeaderProps = {
    onOpenCreate: () => void;  // opens your existing "create activity" modal
    onOpenFilter: () => void;  // opens your filter UI (sheet/modal)
    className?: string;
};

export function ActivityHeader({ onOpenCreate, onOpenFilter, className = "" }: ActivityHeaderProps) {

    const [atTop, setAtTop] = useState(true);

    useEffect(() => {
        const handler = () => setAtTop(window.scrollY === 0);
        handler(); // run once on mount
        window.addEventListener("scroll", handler, { passive: true });
        return () => window.removeEventListener("scroll", handler);

    }, []);
    return (
        <header
            className={`sticky top-0 z-50 transition-colors duration-200
        ${atTop
                    ? "bg-gray" // solid when at top
                    : "bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60"} 
        ${className}`}
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
