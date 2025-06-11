import React from 'react';
import { useState } from 'react';
import { Dog, SelectedDog } from '../types/Dog';



interface DogSelectorProps {
  selectedDogs: SelectedDog[];
  setSelectedDogs: (dogs: SelectedDog[]) => void;
  dogs: Map<number, Dog>;
}

const DogSelector: React.FC<DogSelectorProps> = ({ selectedDogs, setSelectedDogs, dogs }) => {
  const [editingRatings, setEditingRatings] = useState<{ [dog_id: number]: string }>({});


  const handleDogToggle = (dog_id: number) => {
    const exists = selectedDogs.find(d => d.dog_id === dog_id);
    if (exists) {
      setSelectedDogs(selectedDogs.filter(d => d.dog_id !== dog_id));
    } else {
      setSelectedDogs([...selectedDogs, { dog_id, rating: 10 }]);
    }
  };

  const handleRatingChange = (dog_id: number, rating: number) => {
    setSelectedDogs(selectedDogs.map(d =>
      d.dog_id === dog_id ? { ...d, rating } : d
    ));
  };
  return (
    <div className="mb-4">
      <label className="block text-gray-700 mb-2">Select Dogs</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...dogs.values()].map(dog => {
          const selected = selectedDogs.find(d => d.dog_id === dog.id);
          return (
            <div
              key={dog.id}
              className={`p-2 border rounded cursor-pointer ${selected ? 'border-success' : 'border-gray-300'}`}
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
                  min={0}
                  max={10}
                  value={editingRatings[dog.id] ?? selected.rating.toString()}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d{0,2}$/.test(val)) {
                      setEditingRatings(prev => ({ ...prev, [dog.id]: val }));
                    }
                  }}
                  onBlur={() => {
                    const input = editingRatings[dog.id];
                    const rating = Number(input);
                    if (!isNaN(rating) && rating >= 0 && rating <= 10) {
                      handleRatingChange(dog.id, rating);
                    }
                    setEditingRatings(prev => {
                      const { [dog.id]: _, ...rest } = prev;
                      return rest;
                    });
                  }}
                  className={`w-full mt-1 text-sm text-center border rounded appearance-none 
                      [&::-webkit-outer-spin-button]:appearance-none 
                      [&::-webkit-inner-spin-button]:appearance-none 
                      [appearance:textfield] ${editingRatings[dog.id] !== undefined &&
                      (Number(editingRatings[dog.id]) < 0 || Number(editingRatings[dog.id]) > 10)
                      ? 'border-red-500'
                      : ''
                    }`}
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
