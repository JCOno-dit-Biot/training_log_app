import { useEffect, useState } from 'react';
import { getActivities, deleteActivity } from '../api/activities';
import ActivityCard from '../components/ActivityCard';
import { Activity } from '../types/Activity';
import AddActivityButton from "../components/AddActivityButton";
import AddActivityForm from "../components/AddActivityForm";


export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);

  const openEditModal = (activity: Activity) => {
    setEditActivity(activity);
    setShowModal(true);
  };
  useEffect(() => {
    getActivities( {limit: 10, offset: 0, filters: {}} )
      .then((data) => {
        setActivities(data);
      })
      .catch(console.error);
  }, []);

  const reloadActivities = async () => {
    const data = await getActivities({limit: 10, offset: 0, filters: {}});
    setActivities(data);
  };

  const handleDelete = async(activity_id: number) => {

    try{
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
      <h2 className="text-xl font-semibold text-charcoal">Recent Activity</h2>
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity} 
          onDelete={handleDelete} 
          onSuccess={reloadActivities}
          onEdit={openEditModal}/>
      ))}
      
      <AddActivityButton onClick={() => setShowModal(true)} />

      {showModal && (
        <div className="fixed inset-0 bg-primary/80 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md max-w-xl max-h-[95vh] w-full overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✖
            </button>
            <AddActivityForm 
              initialData={editActivity}
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
