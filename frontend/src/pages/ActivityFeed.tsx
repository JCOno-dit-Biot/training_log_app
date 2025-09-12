import { useEffect, useState, useRef } from 'react';
import { getActivities, deleteActivity } from '../api/activities';
import { getWeeklyStats } from '../api/stats/weeklyStats';
import { getCalendarDay } from '../api/stats/dogCalendarDay';
import ActivityCard from '../components/ActivityCard';
import { RightSidebar } from '../components/stats_sidebar/RightSideBar';
import { Activity, PaginatedActivities } from '../types/Activity';
import { ActivityFilter } from '../types/ActivityFilter';
import { DogCalendarDay } from '../types/DogCalendarDay';
import { WeeklyStats } from '../types/WeeklyStats';
import AddActivityButton from "../components/AddActivityButton";
import AddActivityForm from "../components/AddActivityForm";
import { useGlobalCache } from '../context/GlobalCacheContext';
import { SlidersHorizontal } from 'lucide-react';
import { Transition } from '@headlessui/react';
import { useClickAway } from 'react-use'; // optional for clean click-out
import ActivityFilterPanel from '../components/ActivityFilterPanel'
import { ActivityHeader } from '../components/ActivityHeader';
import Pagination from '../components/Pagination';



export default function ActivityFeed() {
  //const [activities, setActivities] = useState<Activity[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ActivityFilter>({})
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


  useClickAway(panelRef, () => setShowFilters(false));

  const openEditModal = (activity: Activity) => {
    setEditActivity(activity);
    setShowModal(true);
  };

  const { sports, runners, dogs } = useGlobalCache();

  const loadPage = async (offset: number, filtersOverride: ActivityFilter = filters) => {
    try {
      const result = await getActivities({ sports, limit: pagination.limit, offset, filters: filtersOverride });
      setPagination(result);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  };

  useEffect(() => {
    loadPage(0);
  }, []);

  useEffect(() => {
    const { __trigger, ...filtersToSend } = filters;
    if (filters.__trigger === 'calendar') {
      const fetch = async () => {
        try {
          const results = await getActivities({ sports, filters: filtersToSend, limit: 10, offset: 0 });
          setPagination(results);

          // Strip the trigger tag after applying
          setFilters(prev => {
            const { __trigger, ...cleaned } = prev;
            return cleaned;
          });
        } catch (err) {
          console.error('Failed to fetch activities:', err);
        }
      };

      fetch(); // call it
    }
  }, [filters]);



  const reloadActivities = async () => {
    loadPage(0);
  };

  const applyFilters = async () => {
    loadPage(0, filters)
  };


  const handleDelete = async (activity_id: number) => {

    try {
      const res = await deleteActivity(activity_id);

      if (res.success) {

        setPagination(prev => ({
          ...prev,
          data: prev.data.filter(a => a.id !== activity_id),
          total_count: prev.total_count - 1
        }));
      }
    } catch (err) {
      console.error('Failed to delete activity', err);
    }
  }


  return (
    <section className="flex relative">
      <main className="flex-1 pr-[345px] space-y-4 relative">
        <ActivityHeader
          onOpenCreate={() => setShowModal(true)}
          onOpenFilter={() => setShowFilters((v) => !v)}
          // className optional if you need extra padding/margins
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
                onClear={() => setFilters({})}
              />
            </div>
          </Transition>
        </div>

        {pagination.data.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onDelete={handleDelete}
            onSuccess={reloadActivities}
            onEdit={openEditModal} />
        ))}

        <Pagination
          total={pagination.total_count}
          limit={pagination.limit}
          offset={pagination.offset}
          onPageChange={loadPage}
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
