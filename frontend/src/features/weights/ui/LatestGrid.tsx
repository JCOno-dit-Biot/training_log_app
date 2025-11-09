// src/features/weights/LatestGrid.tsx
import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import type { LatestWeight } from '@/entities/dogs/model';
import type { Dog } from '@/entities/dogs/model';
import { formatMonthDay } from '@/shared/util/dates';

import { convertWeight } from '../util/convertUnit'

import { AddWeightModal } from './AddWeightModal';

type Unit = 'kg' | 'lb';

export function LatestGrid({
    latest,
    dogs,
    unit,
}: {
    latest: LatestWeight[];
    dogs: Dog[];
    unit: Unit;
}) {
    const [openForDog, setOpenForDog] = useState<number | null>(null);
    const byDog = useMemo(() => new Map(latest.map(l => [l.dog_id, l])), [latest]);

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {dogs.map(d => {
                    const l = byDog.get(d.id);
                    const val = l ? (unit === 'kg' ? l.latest_weight : convertWeight(l.latest_weight, 'kg', unit)) : null;
                    const delta = l?.weight_change ?? null;
                    const deltaDisplay = delta == null ? null : (unit === 'kg' ? delta : convertWeight(delta, 'kg', unit));
                    const sign = deltaDisplay != null && deltaDisplay > 0 ? '▲' : deltaDisplay != null && deltaDisplay < 0 ? '▼' : '';
                    return (
                        <div key={d.id} className=" relative rounded-xl border border-gray-300 bg-white p-3 shadow-md items-center gap-1">


                            <button
                                className="absolute top-1 right-1 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                                onClick={() => setOpenForDog(d.id)}
                                title="Add weight"
                            >
                                <Plus size={20} strokeWidth={2} />
                            </button>

                            <div className="mt-2 flex items-center gap-8">
                                <img
                                    src={`/profile_picture/dogs/${d.image_url}`}
                                    alt={d.name}
                                    className="w-20 h-20 rounded-full border-3 object-cover p-1"
                                    style={{ borderColor: d.color ?? '#9ca3af' }} // fallback to gray
                                />
                                <div className="font-semibold text-xl">{d.name}</div>
                            </div>
                            <div className="mt-4 space-y-1 flex flex-col text-left gap-3">
                                <div className="text-4xl font-bold tracking-tight">
                                    {val != null ? `${val.toFixed(1)} ${unit}` : '—'}
                                </div>
                                <div className="text-lg text-gray-600">
                                    {deltaDisplay != null ? (
                                        <span>
                                            {sign} {Math.abs(deltaDisplay).toFixed(1)} {unit} since last
                                        </span>
                                    ) : (
                                        'No previous data'
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {l?.latest_update ? `Updated ${formatMonthDay(l.latest_update)}` : '—'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <AddWeightModal
                open={openForDog != null}
                dogId={openForDog ?? 0}
                onClose={() => setOpenForDog(null)}
            />
        </>
    );
}
