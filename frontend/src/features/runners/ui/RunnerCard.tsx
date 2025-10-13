import React from 'react';
import { Runner } from '@entities/runners/model';

interface RunnerCardProps {
  runner: Runner;
}

export default function RunnerCard({ runner }: RunnerCardProps) {

  const DEFAULT_AVATAR = "https://img.icons8.com/ios-filled/100/cccccc/user-male-circle.png"

  return (
    <div className="relative flex flex-col justify-between border border-gray-300 rounded-xl shadow-md p-4 w-full sm:w-64 h-40 bg-white">
      {/* Top-left: name and breed */}
      <div className="text-left">
        <h2 className="text-lg font-bold text-gray-800">{runner.name}</h2>
      </div>
      <img
        src={runner.image_url ? `/profile_picture/runners/${runner.image_url}` : DEFAULT_AVATAR}
        alt={runner.name}
        className="absolute top-3 right-6 aspect-square w-auto h-25 rounded-full object-cover border"
      />
    </div>
  );
}
