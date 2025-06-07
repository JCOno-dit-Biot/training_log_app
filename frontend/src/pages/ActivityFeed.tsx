import { useEffect, useState } from 'react';
import { getActivities } from '../api/activities';
import ActivityCard from '../components/ActivityCard';
import { Activity } from '../types/Activity';
import AddActivityButton from "../components/AddActivityButton";
import AddActivityForm from "../components/AddActivityForm";

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    getActivities()
      .then((data) => {
        // const sorted = data.sort(
        //   (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        // );
        setActivities(data);
      })
      .catch(console.error);
  }, []);

  return (
    <section className="space-y-4 relative">
      <h2 className="text-xl font-semibold text-charcoal">Recent Activity</h2>
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
      
      <AddActivityButton onClick={() => setShowModal(true)} />

      {showModal && (
        <div className="fixed inset-0 bg-primary bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md max-w-xl w-full relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✖
            </button>
            <AddActivityForm onClose={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </section>
  );
}
