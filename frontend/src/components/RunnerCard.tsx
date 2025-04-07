import React from 'react';
import { Runner } from '../types/Runner';

interface RunnerCardProps {
  runner: Runner;
}

export default function RunnerCard({ runner }: RunnerCardProps) {

  return (
    <div className="relative flex flex-col justify-between border border-gray-300 rounded-xl shadow-md p-4 w-full sm:w-64 h-40 bg-white">
      {/* Top-left: name and breed */}
      <div className="text-left">
        <h2 className="text-lg font-bold text-gray-800">{runner.name}</h2>
      </div>
    </div>
  );
}
