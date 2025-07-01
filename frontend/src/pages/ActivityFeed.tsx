import { useEffect, useState, useRef } from 'react';
import { getActivities, deleteActivity } from '../api/activities';
import ActivityCard from '../components/ActivityCard';
import { Activity } from '../types/Activity';
import { ActivityFilter } from '../types/ActivityFilter';
import AddActivityButton from "../components/AddActivityButton";
import AddActivityForm from "../components/AddActivityForm";
import { useGlobalCache } from '../context/GlobalCacheContext';
import { FunnelIcon } from 'lucide-react';
import { Transition } from '@headlessui/react';
import { useClickAway } from 'react-use'; // optional for clean click-out
import ActivityFilterPanel from '../components/ActivityFilterPanel';

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ActivityFilter>({})
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const panelRef = useRef(null);

  useClickAway(panelRef, () => setShowFilters(false));

  const openEditModal = (activity: Activity) => {
    setEditActivity(activity);
    setShowModal(true);
  };

  const { sports, runners, dogs } = useGlobalCache();

  useEffect(() => {
    getActivities({ sports, limit: 10, offset: 0, filters: {} })
      .then((data) => {
        setActivities(data);
      })
      .catch(console.error);
  }, []);

  const reloadActivities = async () => {
    const data = await getActivities({ sports, limit: 10, offset: 0, filters: {} });
    setActivities(data);
  };

  const applyFilters = async () => {
    const data = await getActivities({ sports, filters, limit: 10, offset: 0 });
    setActivities(data);
  };

  const handleDelete = async (activity_id: number) => {

    try {
      const res = await deleteActivity(activity_id);

      if (res.success) {
        setActivities(prev => prev.filter(a => a.id !== activity_id));
      }
    } catch (err) {
      console.error('Failed to delete activity', err);
    }
  }


  return (
    <section className="space-y-4 relative">
      <div className='relative flex justify-center items-center py-2'>
        <h2 className="flex text-xl text-center font-semibold text-charcoal">Recent Activity</h2>
        <div className="absolute right-0 top-0">
          <button
            onClick={() => setShowFilters(prev => !prev)}
            className={`flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-100 z-30 relative ${showFilters ? 'bg-gray-100' : ''
              }`}
          >
            <FunnelIcon className="w-4 h-4" />
            Filter
          </button>
        </div>
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
            className="absolute right-0 top-full mt-2 w-72 p-4 bg-white border rounded-lg shadow-lg z-10"
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

      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onDelete={handleDelete}
          onSuccess={reloadActivities}
          onEdit={openEditModal} />
      ))}

      <AddActivityButton onClick={() => setShowModal(true)} />

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
    </section>
  );
}
