import { useEffect, useState, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Activity, PaginatedActivities, ActivityFilter } from '../types/Activity';

import { Transition } from '@headlessui/react';
import { useClickAway } from 'react-use'; // optional for clean click-out
;

import { useSports } from '../hooks/useSports';
import { useDogs } from '../hooks/useDogs';
import { useRunners } from '../hooks/useRunners';

import { useActivitiesQuery, usePrefetchActivitiesOffset } from '../hooks/useActivities';
import { useDeleteActivity } from '../hooks/useActivities';
//import { useDeleteActivity } from '@/features/activities/mutations';
import { qk } from '../api/keys';

import ActivityFilterPanel from '../components/ActivityFilterPanel'
import { ActivityHeader } from '../components/ActivityHeader';
import Pagination from '../components/Pagination'
import ActivityCard from '../components/ActivityCard';
import { RightSidebar } from '../components/stats_sidebar/RightSideBar';
import AddActivityForm from "../components/AddActivityForm";


export default function ActivityFeed() {
  //const [activities, setActivities] = useState<Activity[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ActivityFilter>({}) // should we use useMemo()?
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
    offset: page?.next ?? offset + limit,
    filters: filtersForQuery,
  });
  

  // Calendar: when a date click sets __trigger='calendar', fetch immediately then strip the flag
  useEffect(() => {
    if ((filters as any).__trigger === 'calendar') {
      setOffset(0); // go to first page for a new date range
      // strip the trigger so it doesn't persist
      setFilters(prev => {
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
  }

  return (
     <section className="flex relative">
      <main className="flex-1 pr-[345px] space-y-4 relative">
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
              className="absolute right-0 top-full mt-2 w-72 p-4 bg-white border border-stone rounded-lg shadow-lg z-10"
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
            onEdit={openEditModal} />
        ))}

        <Pagination
          total={page?.total_count ?? 0}
          limit={page?.limit ?? limit}
          offset={page?.offset ?? offset}
          onPageChange={(newOffset) => setOffset(newOffset)}
        />




        {showModal && (
          <div className="fixed inset-0 bg-primary/80 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-md max-w-xl max-h-[95vh] w-full overflow-y-auto p-6 relative">
              <button
                onClick={() => { setShowModal(false); setEditActivity(null); }}
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
                }} />
            </div>
          </div>
        )}
      </main>
      <RightSidebar
        dogs={dogs}
        filters={filters}
        setFilters={setFilters} />
     </section >

  );
}
