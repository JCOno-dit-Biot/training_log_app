import { useEffect, useState } from 'react';
import { getActivities } from '../api/activities';
import ActivityCard from '../components/ActivityCard';
import { Activity } from '../types/Activity';

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

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
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-charcoal">Recent Activity</h2>
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </section>
  );
}
