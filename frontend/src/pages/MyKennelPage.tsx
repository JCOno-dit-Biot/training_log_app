import { useEffect, useState } from 'react';
import { useDogs } from '../hooks/useDogs';
import { useRunners } from '../hooks/useRunners';
import { Dog } from '../types/Dog';
import { Runner } from '../types/Runner';
import RunnerCard from '../components/RunnerCard';
import DogCard from '../components/DogCard';

export default function MyKennelPage() {
  // const [runners, setRunners] = useState<Runner[]>([]);
  // const [dogs, setDogs] = useState<Dog[]>([]);

  // useEffect(() => {
  //   getRunners().then(setRunners).catch(console.error);
  //   getDogs().then(setDogs).catch(console.error);
  // }, []);

  const { list: dogs } = useDogs();
  const { list: runners } = useRunners();

  const sortedDogs = [...dogs].sort(
    (a, b) => new Date(a.date_of_birth).getTime() - new Date(b.date_of_birth).getTime()
  );
  return (
    <div className="space-y-20 max-w-full">
      {/* Runners Section */}
      <section className='w-full max-w-full mt-4'>
        <h2 className="text-2xl text-centered font-bold mb-4 p-1 text-cream bg-primary rounded">Runners</h2>
        <div className='overflow-x-auto max-w-full scroll-snap-x scroll-smooth'>
          <div className="flex gap-3 pb-2 snap-x snap-mandatory">
            {runners.map((runner) => (
              <div key={runner.id} className="flex-shrink-0 snap-start w-[80%] sm:w-[50%] md:w-[33%] lg:w-[25%]">
                <RunnerCard key={runner.id} runner={runner} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dogs Section */}
      <section className='w-full max-w-full'>
        <h2 className="text-2xl font-bold mb-4 p-1 text-cream bg-primary rounded">Dogs</h2>
        <div className='overflow-x-auto max-w-full scroll-snap-x scroll-smooth'>
          <div className="flex gap-3 pb-2 snap-x snap-mandatory">
            {sortedDogs.map(dog => (
              <div key={dog.id} className="flex-shrink-0 snap-start w-[80%] sm:w-[50%] md:w-[33%] lg:w-[25%]">
                <DogCard dog={dog} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}