import { useMemo, useState } from 'react';

import type { FetchWeightsParams } from '@/entities/dogs/model';
import { useDogs } from '@/features/dogs/model/useDogs';
import { useLatestAll } from '@/features/weights/model/useDogWeightLatest';
import { useWeights } from '@/features/weights/model/useDogWeights';
import { LatestGrid } from '@/features/weights/ui/LatestGrid';
import { WeightsMultiChart } from '@/features/weights/ui/WeightChart';

type Unit = 'kg' | 'lb'

export default function WeightsPage() {
    const [dogId, setDogId] = useState<number | undefined>();
    const [preset, setPreset] = useState<'90d' | 'ytd' | '1y' | 'all'>('90d');
    const [unit, setUnit] = useState<Unit>('lb');

    const { list: dogs } = useDogs();
    const { data: latest = [] } = useLatestAll();

    // When dogs are loaded, default to first one
    // useEffect(() => {
    //     if (!dogId && dogs?.length) {
    //         setDogId(dogs[0].id);
    //     }
    // }, [dogs, dogId]);

    const sortedDogs = [...dogs].sort(
        (a, b) => new Date(a.date_of_birth).getTime() - new Date(b.date_of_birth).getTime(),
    );

    const range = useMemo(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const pad = (n: number) => String(n).padStart(2, '0');
        const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

        if (preset === 'all') return { start: undefined, end: undefined };
        if (preset === 'ytd') return { start: `${yyyy}-01-01`, end: undefined };

        const d = new Date(today);
        if (preset === '90d') d.setDate(d.getDate() - 90);
        if (preset === '1y') d.setFullYear(d.getFullYear() - 1);

        return { start: ymd(d), end: undefined };
    }, [preset]);

    const params = useMemo<FetchWeightsParams>(() => ({
        dogId,
        start_date: range.start,
        end_date: range.end,
    }), [dogId, range]);

    const { data = [], isLoading } = useWeights(params);


    return (
        <div className="max-w-7xl mx-auto p-4 space-y-4">
            {/* Row 1: cards */}
            <LatestGrid latest={latest} dogs={sortedDogs} unit={unit} />

            {/* Row 2: controls + chart */}
            <div className="rounded-2xl border border-gray-300 shadow-md p-4">
                <div className="flex flex-wrap justify-between gap-3 items-end mb-3">
                    <div>
                        <label className="text-sm block mb-1">Dog</label>
                        <select
                            className="border rounded-xl px-3 py-2"
                            value={dogId === 'all' ? 'all' : String(dogId)}
                            onChange={e => setDogId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        >
                            <option value="all">All dogs</option>
                            {sortedDogs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm block mb-1">Range</label>
                        <div className="flex gap-2">
                            {(['90d', 'ytd', '1y', 'all'] as const).map(k => (
                                <button key={k}
                                    onClick={() => setPreset(k)}
                                    className={`px-3 py-2 rounded-xl border ${preset === k ? 'bg-gray-100' : ''}`}>
                                    {k.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm block mb-1">Unit</label>
                        <div className="flex gap-2">
                            <button className={`px-3 py-2 rounded-xl border ${unit === 'kg' ? 'bg-gray-100' : ''}`} onClick={() => setUnit('kg')}>kg</button>
                            <button className={`px-3 py-2 rounded-xl border ${unit === 'lb' ? 'bg-gray-100' : ''}`} onClick={() => setUnit('lb')}>lb</button>
                        </div>
                    </div>
                </div>


                {isLoading ? (
                    <div className="rounded-2xl border p-4 text-sm text-gray-500">Loading…</div>
                ) : (
                    <WeightsMultiChart
                        entries={data}
                        unit={unit}
                        dogs={sortedDogs}
                        preset={preset}
                    />
                )}
            </div>
        </div>
    );
}