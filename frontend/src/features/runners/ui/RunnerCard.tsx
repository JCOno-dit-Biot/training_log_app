import React from 'react';

import type { Runner } from '@entities/runners/model';

interface RunnerCardProps {
  runner: Runner;
}

export default function RunnerCard({ runner }: RunnerCardProps) {
  const DEFAULT_AVATAR = 'https://img.icons8.com/ios-filled/100/cccccc/user-male-circle.png';

  return (
    <div className="relative flex h-40 w-full flex-col justify-between rounded-xl border border-gray-300 bg-white p-4 shadow-md sm:w-64">
      {/* Top-left: name and breed */}
      <div className="text-left">
        <h2 className="text-lg font-bold text-gray-800">{runner.name}</h2>
      </div>
      <img
        src={runner.image_url ? `/profile_picture/runners/${runner.image_url}` : DEFAULT_AVATAR}
        alt={runner.name}
        className="absolute top-3 right-6 aspect-square h-25 w-auto rounded-full border object-cover"
      />
    </div>
  );
}
