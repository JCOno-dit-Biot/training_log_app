import { useMemo, useState } from 'react';

import type { FetchWeightsParams } from '@/entities/dogs/model';
import { useDogs } from '@/features/dogs/model/useDogs';
import { useWeights } from '@/features/weights/model/useDogWeights';
import { AddWeight } from '@/features/weights/ui/AddWeight';
//import { WeightChart } from '@/features/weights/WeightChart';

export default function WeightsPage() {
    const [dogId, setDogId] = useState<number>(0);
    const [preset, setPreset] = useState<'30d' | '90d' | 'ytd' | 'all'>('90d');

    const { list: dogs } = useDogs();

    const range = useMemo(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const pad = (n: number) => String(n).padStart(2, '0');

        if (preset === 'all') return { start: undefined, end: undefined };
        if (preset === 'ytd') return { start: `${yyyy}-01-01`, end: undefined };

        const d = new Date(today);
        if (preset === '30d') d.setDate(d.getDate() - 30);
        if (preset === '90d') d.setDate(d.getDate() - 90);

        return {
            start: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
            end: undefined,
        };
    }, [preset]);

    const params = useMemo<FetchWeightsParams>(() => ({
        dogId,
        start_date: range.start,
        end_date: range.end,
    }), [dogId, range]);

    const { data = [], isLoading } = useWeights(params);

    return (
        <div className="max-w-5xl mx-auto p-4 flex flex-col gap-4">
            {/* Header filters */}
            <div className="flex flex-wrap items-end gap-3">
                <div>
                    <label className="text-sm block mb-1">Dog</label>
                    <select
                        className="border rounded-xl px-3 py-2"
                        value={dogId}
                        onChange={e => setDogId(Number(e.target.value))}
                    >
                        {dogs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="text-sm block mb-1">Range</label>
                    <div className="flex gap-2">
                        {(['30d', '90d', 'ytd', 'all'] as const).map(k => (
                            <button
                                key={k}
                                onClick={() => setPreset(k)}
                                className={`px-3 py-2 rounded-xl border ${preset === k ? 'bg-gray-100' : ''}`}
                            >
                                {k.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick add */}
            <AddWeight dogId={dogId} listParams={params} />

            {/* Chart
      {isLoading ? (
        <div className="rounded-2xl border p-4 text-sm text-gray-500">Loading…</div>
      ) : (
        <WeightChart entries={data} />
      )} */}
        </div>
    );
}