import React, { useEffect, useState } from 'react';
import { getDogs } from '../api/dogs';
import DogCard from '../components/DogCard';
import { Dog } from '../types/Dog'

export default function DogsPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);

  useEffect(() => {
    getDogs().then(setDogs).catch(console.error);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Dogs</h1>

      {/* Vertical list */}
      {/* <div className="space-y-4">
        {dogs.map(dog => (
          <DogCard key={dog.id} dog={dog} />
        ))}
      </div> */}

      {/* Horizontal scroll option: */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {dogs.map(dog => (
          <div key={dog.id} className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
          <DogCard dog={dog} />
          </div>
        ))}
      </div>
     
    </div>
  );
}
