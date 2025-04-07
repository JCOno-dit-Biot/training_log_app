import React from 'react';
import { Dog } from '../types/Dog';

interface DogCardProps {
  dog: Dog;
}

export default function DogCard({ dog }: DogCardProps) {
  const [year, month, day] = dog.date_of_birth.split('-');
  const dobFormatted = new Date(`${month}/${day}/${year}`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative flex flex-col justify-between border border-gray-300 rounded-xl shadow-md p-4 w-full sm:w-64 h-40 bg-white">
      {/* Top-left: name and breed */}
      <div className="text-left">
        <h2 className="text-lg font-bold text-gray-800">{dog.name}</h2>
        <p className="text-sm text-gray-600">{dog.breed}</p>
      </div>

      {/* Bottom-right: DOB */}
      <p className="absolute bottom-3 right-4 text-xs text-gray-500">
        DOB: {dobFormatted}
      </p>
    </div>
  );
}
