import { useEffect, useMemo, useRef, useState } from 'react';

// optional for clean click-out
import Pagination from '@shared/ui/pagination';
import type { Activity, ActivityFilter, ActivityHeatData } from '@entities/activities/model';
import { useDeleteActivity } from '@features/activities/activity-editor/model/useActivitiesMutations';
import AddActivityForm from '@features/activities/activity-editor/ui/AddActivityForm';
import {
  useActivitiesQuery,
  usePrefetchActivitiesOffset,
} from '@features/activities/activity-feed/model/useActivities';
import ActivityCard from '@features/activities/activity-feed/ui/ActivityCard';
import ActivityFilterPanel from '@features/activities/activity-feed/ui/ActivityFilterPanel';
import { ActivityHeader } from '@features/activities/activity-feed/ui/ActivityHeader';
import { RightSidebar } from '@features/activities/activity-stats/ui/stats_sidebar/RightSideBar';
import { useDogs } from '@features/dogs/model/useDogs';
import { useRunners } from '@features/runners/model/useRunners';
import { useSports } from '@features/sports/model/useSports';
import { getActivityHeatData } from '@/entities/activities/api/activities';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
//import { useClickAway } from 'react-use';
import { useClickAwayIgnoringRadix } from '@/shared/util/useClickAwayIgnoreRadix';

import { Transition } from '@headlessui/react';
import { useQueryClient } from '@tanstack/react-query';

export default function ActivityFeed() {
  //const [activities, setActivities] = useState<Activity[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ActivityFilter>({}); // should we use useMemo()?
  // edit states
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const [editHeatData, setEditHeatData] = useState<ActivityHeatData | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{ top: number; left: number } | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);

  //set defaults for pagination
  const limit = 10;
  const [offset, setOffset] = useState<number>(0);

  useClickAwayIgnoringRadix(
    [panelRef, mobilePanelRef, filterButtonRef],
    () => setShowFilters(false),
    showFilters
  );

  const { byId: sports } = useSports();
  const { byId: dogs } = useDogs();
  const { byId: runners } = useRunners();

  const filtersForQuery = useMemo(() => {
    const { __trigger, ...rest } = filters;
    return rest;
  }, [filters]);

  const {
    items: activities,
    page,
    hasNext,
  } = useActivitiesQuery({ limit, offset, filters: filtersForQuery });

  // Prefetch the next page on hover/focus (optional UX sugar)
  const prefetchNext = usePrefetchActivitiesOffset({
    limit,
    offset: offset + limit,
    filters: filtersForQuery,
  });

  // this will make the pannel follow the button while scrolling
  useEffect(() => {
    if (!showFilters || !filterButtonRef.current) return;

    const updatePosition = () => {
      const rect = filterButtonRef.current!.getBoundingClientRect();
      const panelWidth = 288; // w-72 = 18rem = 288px
      const gap = 8;

      let left = rect.right - panelWidth;
      let top = rect.bottom + gap;

      left = Math.max(16, Math.min(left, window.innerWidth - panelWidth - 16));

      setPanelPosition({ top, left });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showFilters]);

  useEffect(() => {
    if (!page || !hasNext) return;
    // Don’t block the main render; prefetch when the browser is idle if available.
    if ('requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(() => prefetchNext());
      return () => (window as any).cancelIdleCallback?.(id);
    } else {
      const t = setTimeout(() => prefetchNext(), 0);
      return () => clearTimeout(t);
    }
  }, [page?.next, hasNext, prefetchNext]);

  // Calendar: when a date click sets __trigger='calendar', fetch immediately then strip the flag
  useEffect(() => {
    if ((filters as any).__trigger === 'calendar') {
      setOffset(0); // go to first page for a new date range
      // strip the trigger so it doesn't persist
      setFilters((prev) => {
        const { __trigger, ...rest } = prev as any;
        return rest;
      });
    }
  }, [filters]);

  // Mutations
  const qc = useQueryClient();
  const { mutate: deleteActivity, isPending: deleting } = useDeleteActivity();

  const reloadActivities = () => {
    // re-fetch active lists (the current page + any mounted pages)
    qc.invalidateQueries({ queryKey: ['activities'], refetchType: 'active' });
  };

  const openEditModal = async (activity: Activity) => {
    setLoadingEdit(true);
    try {
      let heatData: ActivityHeatData | null = null;

      if (activity.has_heat_data && activity.id != null) {
        heatData = await getActivityHeatData(activity.id);
      }

      setEditActivity(activity);
      setEditHeatData(heatData);
      setShowModal(true);
    } finally {
      setLoadingEdit(false);
    }
  };


  const applyFilters = () => {
    setOffset(0);
    setShowFilters(false);
    // The query auto-refetches because filtersForQuery changed
  };

  const handleDelete = async (activity_id: number) => {
    // Optimistic remove handled in the mutation hook; this will also tidy caches
    deleteActivity(activity_id);
  };

  const handleClose = () => {
    setEditActivity(null);
    setShowModal(false);
  };

  const handleSuccess = () => {
    reloadActivities();
    handleClose();
  };

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-[1600px] px-4 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <main className="min-w-0">
            <div className="mx-auto w-full max-w-3xl space-y-4">
              <ActivityHeader
                onOpenCreate={() => setShowModal(true)}
                onOpenFilter={() => setShowFilters((v) => !v)}
                filterButtonRef={filterButtonRef}
              />

              {/* Mobile backdrop */}
              <Transition
                as="div"
                show={showFilters}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="sm:hidden fixed inset-0 z-40 bg-black/30"
                onClick={() => setShowFilters(false)}
              />

              {/* Mobile sheet */}
              <Transition
                show={showFilters}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div
                  ref={mobilePanelRef}
                  className="sm:hidden fixed inset-x-4 top-20 bottom-20 z-50 overflow-y-auto rounded-lg border border-neutral-500 bg-card p-4 shadow-lg"
                >
                  <ActivityFilterPanel
                    filters={filters}
                    setFilters={setFilters}
                    runners={runners}
                    dogs={dogs}
                    sports={sports}
                    onApply={applyFilters}
                    onClear={() => setFilters({})}
                  />
                </div>
              </Transition>

              {/* Desktop popover */}
              {panelPosition && (
                <Transition
                  show={showFilters}
                  enter="transition ease-out duration-150"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                  ref={panelRef}
                  style={{
                    top: panelPosition.top,
                    left: panelPosition.left,
                  }}
                >
                  <div
                    ref={panelRef}
                    className="hidden sm:block fixed z-50 w-72 rounded-lg border border-neutral-500 bg-card p-4 shadow-lg"
                  >
                    <ActivityFilterPanel
                      filters={filters}
                      setFilters={setFilters}
                      runners={runners}
                      dogs={dogs}
                      sports={sports}
                      onApply={applyFilters}
                      onClear={() => setFilters({})}
                    />
                  </div>
                </Transition>
              )}
              <div className="w-full mx-auto max-w-2xl space-y-4">
                {activities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onDelete={handleDelete}
                    onSuccess={reloadActivities}
                    onEdit={openEditModal}
                  />
                ))}

                <Pagination
                  total={page?.total_count ?? 0}
                  limit={page?.limit ?? limit}
                  offset={page?.offset ?? offset}
                  onPageChange={(newOffset) => setOffset(newOffset)}
                />
              </div>

              <Dialog open={showModal}
                onOpenChange={(open) => {
                  // This catches ESC, clicking overlay, etc.
                  if (!open) handleClose();
                  else setShowModal(true);
                }}>
                <DialogContent className="max-w-2xl h-[90vh] flex flex-col bg-card/95 backdrop-blur-sm p-0">
                  <DialogHeader className="px-6 pt-6">
                    <DialogTitle>
                      {editActivity ? "Edit Activity" : "Add New Activity"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto">
                    <AddActivityForm
                      onSuccess={handleSuccess}
                      onClose={handleClose}
                      initialData={editActivity}
                      initialHeatData={editHeatData}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </main>

          <aside className="hidden lg:block -mr-4 lg:-mr-6">
            <RightSidebar dogs={dogs} filters={filters} setFilters={setFilters} />
          </aside>
        </div>
      </div >
    </section >
  );
}
