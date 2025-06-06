import React from 'react';
import { Dog, SelectedDog } from '../types/Dog';


interface DogSelectorProps {
  selectedDogs: SelectedDog[];
  setSelectedDogs: (dogs: SelectedDog[]) => void;
  dogs: Map<number, Dog>;
}

const DogSelector: React.FC<DogSelectorProps> = ({ selectedDogs, setSelectedDogs, dogs }) => {
  const handleDogToggle = (dogId: number) => {
    const exists = selectedDogs.find(d => d.dogId === dogId);
    if (exists) {
      setSelectedDogs(selectedDogs.filter(d => d.dogId !== dogId));
      console.log(selectedDogs)
    } else {
      console.log(selectedDogs)
      setSelectedDogs([...selectedDogs, { dogId, rating: 10 }]);
    }
  };

  const handleRatingChange = (dogId: number, rating: number) => {
    setSelectedDogs(selectedDogs.map(d =>
      d.dogId === dogId ? { ...d, rating } : d
    ));
  };
  return (
    <div className="mb-4">
      <label className="block text-gray-700 mb-2">Select Dogs</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...dogs.values()].map(dog => {
          const selected = selectedDogs.find(d => d.dogId === dog.id);
          return (
            <div
              key={dog.id}
              className={`p-2 border rounded cursor-pointer ${selected ? 'border-green-500' : 'border-gray-300'}`}
              onClick={() => handleDogToggle(dog.id)}
            >
              <img
                src={`/profile_picture/dogs/${dog.image_url || 'default.png'}`}
                alt={dog.name}
                className="w-16 h-16 object-cover rounded-full mx-auto"
              />
              <div className="text-center mt-1 text-sm">{dog.name}</div>
              {selected && (
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={selected.rating}
                  onChange={e => handleRatingChange(dog.id, Number(e.target.value))}
                  className="w-full mt-1 text-sm text-center border rounded"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DogSelector;
