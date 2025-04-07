import React, { useEffect, useState } from 'react';
import { getRunners } from '../api/runners';
import RunnerCard from '../components/RunnerCard';
import { Runner } from '../types/Runner'

export default function RunnersPage() {
  const [runners, setRunners] = useState<Runner[]>([]);

  useEffect(() => {
    getRunners().then(setRunners).catch(console.error);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Runners</h1>

      {/* Vertical list */}
      {/* <div className="space-y-4">
        {dogs.map(dog => (
          <DogCard key={dog.id} dog={dog} />
        ))}
      </div> */}

      {/* Horizontal scroll option: */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {runners.map(runner => (
          <div key={runner.id} className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
          <RunnerCard runner={runner} />
          </div>
        ))}
      </div>
     
    </div>
  );
}
