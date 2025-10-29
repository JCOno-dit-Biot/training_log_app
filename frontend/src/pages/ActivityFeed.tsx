import { useEffect, useMemo, useRef, useState } from 'react';
import { useClickAway } from 'react-use'; // optional for clean click-out

import Pagination from '@shared/ui/Pagination';
import type { Activity, ActivityFilter, PaginatedActivities } from '@entities/activities/model';
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

import { Transition } from '@headlessui/react';
import { useQueryClient } from '@tanstack/react-query';

export default function ActivityFeed() {
  //const [activities, setActivities] = useState<Activity[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ActivityFilter>({}); // should we use useMemo()?
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const panelRef = useRef(null);

  const [pagination, setPagination] = useState<PaginatedActivities>({
    data: [],
    total_count: 0,
    limit: 10,
    offset: 0,
    next: null,
    previous: null,
  });

  //set defaults for pagination
  const limit = 10;
  const [offset, setOffset] = useState<number>(0);

  useClickAway(panelRef, () => setShowFilters(false));

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
    hasPrev,
    hasNext,
    isLoading,
    isFetching,
  } = useActivitiesQuery({ limit, offset, filters: filtersForQuery });

  // Prefetch the next page on hover/focus (optional UX sugar)
  const prefetchNext = usePrefetchActivitiesOffset({
    limit,
    offset: offset + limit,
    filters: filtersForQuery,
  });

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

  const openEditModal = (activity: Activity) => {
    setEditActivity(activity);
    setShowModal(true);
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

  return (
    <section className="relative flex">
      <main className="relative flex-1 space-y-4 pr-[345px]">
        <ActivityHeader
          onOpenCreate={() => setShowModal(true)}
          onOpenFilter={() => setShowFilters((v) => !v)}
        />
        <div className="relative">
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
              ref={panelRef}
              className="border-stone absolute top-full right-0 z-10 mt-2 w-72 rounded-lg border bg-white p-4 shadow-lg"
            >
              <ActivityFilterPanel
                filters={filters}
                setFilters={setFilters}
                runners={runners}
                dogs={dogs}
                sports={sports}
                onApply={applyFilters}
                onClear={() => {
                  setFilters({});
                }}
              />
            </div>
          </Transition>
        </div>

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

        {showModal && (
          <div className="bg-primary/80 fixed inset-0 z-50 flex items-center justify-center">
            <div className="relative max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-md bg-white p-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditActivity(null);
                }}
                className="absolute top-2 right-2 text-gray-600 hover:text-black"
              >
                ✖
              </button>
              <AddActivityForm
                initialData={editActivity}
                onSuccess={reloadActivities}
                onClose={() => {
                  setEditActivity(null);
                  setShowModal(false);
                }}
              />
            </div>
          </div>
        )}
      </main>
      <RightSidebar dogs={dogs} filters={filters} setFilters={setFilters} />
    </section>
  );
}
