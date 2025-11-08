import { useMemo, useState } from 'react';
import { Brush, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { Dog } from '@/entities/dogs/model';
import type { WeightEntry } from '@/entities/dogs/model/Weight';

import { convertWeight } from '../util/convertUnit';



const PALETTE = [
    '#2563eb', '#16a34a', '#dc2626', '#a855f7', '#f59e0b', '#0ea5e9', '#ef4444', '#22c55e'
];

type Unit = 'kg' | 'lb';

function pivotWide(entries: WeightEntry[], unit: Unit, dogs: Dog[]) {
    // collect all distinct dates
    const dateSet = new Set(entries.map(e => e.date));
    const dates = Array.from(dateSet).sort(); // sort dates

    // group entries by dog
    const byDog = new Map<number, { name: string; color: string; }>();
    const dogIds: number[] = [];

    const dogLookup = dogs
        ? new Map(dogs.map(d => [d.id, { name: d.name, color: d.color }]))
        : new Map<number, { name: string; color: string }>();

    // fill values per dog/date (convert unit if needed)
    // TODO fix type issues
    for (const e of entries) {
        if (!byDog.has(e.dog?.id)) {
            const dogName = dogLookup.get(e.dog.id)?.name ?? `Dog ${e.dog.id}`;
            byDog.set(e.dog.id, {
                name: dogName,
                color: dogLookup.get(e.dog.id)?.color,
            });
            dogIds.push(e.dog?.id);
        }
    }

    // build wide rows: { label: 'yyyy-MM-dd', [dog_<id>]: value }
    const rows = dates.map(label => {
        const row: any = { label };
        return row;
    });
    const dateIndex = new Map(dates.map((d, i) => [d, i]));

    for (const e of entries) {
        const idx = dateIndex.get(e.date);
        if (idx == null) continue;
        const val = unit === 'kg' ? e.weight : convertWeight(e.weight, 'kg', unit);
        const key = `dog_${e.dog.id}`;
        (rows[idx] as any)[key] = Number(val.toFixed(2));
    }

    const dogsMeta = dogIds.map(id => ({
        id,
        key: `dog_${id}`,
        name: byDog.get(id)!.name,
        color: byDog.get(id)!.color,
    }));

    return { rows, dogsMeta };
}

export function WeightsMultiChart({
    entries,
    unit,
    onUnitChange,
    dogs,
}: {
    entries: WeightEntry[];
    unit: Unit;
    onUnitChange: (u: Unit) => void;
    dogs: Dog[];
}) {
    // equally spaced x-axis: use category axis with label (no date math)
    const [brushRange, setBrushRange] = useState<{ startIndex?: number; endIndex?: number }>({});

    const { rows, dogsMeta } = useMemo(() => pivotWide(entries, unit, dogs), [entries, unit, dogs]);

    if (!rows.length) {
        return <div className="rounded-2xl border p-4 text-sm text-gray-500">No data to show.</div>;
    }

    return (
        <div className="rounded-2xl border p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold">Weights over time</div>
                <div className="flex items-center gap-2 text-sm">
                    <span>Unit:</span>
                    <button
                        className={`px-3 py-1 rounded-xl border ${unit === 'kg' ? 'bg-gray-100' : ''}`}
                        onClick={() => onUnitChange('kg')}
                    >kg</button>
                    <button
                        className={`px-3 py-1 rounded-xl border ${unit === 'lb' ? 'bg-gray-100' : ''}`}
                        onClick={() => onUnitChange('lb')}
                    >lb</button>
                    <button
                        className="ml-3 px-3 py-1 rounded-xl border"
                        onClick={() => setBrushRange({})}
                        title="Reset zoom"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="h-80">
                <ResponsiveContainer>
                    <LineChart data={rows}>
                        <CartesianGrid strokeDasharray="3 3" />
                        {/* category axis → equally spaced labels */}
                        <XAxis dataKey="label" />
                        <YAxis
                            label={{ value: `Weight (${unit})`, angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            formatter={(value: any) => [`${value} ${unit}`, 'Weight']}
                            labelFormatter={(label) => label}
                        />
                        <Legend />
                        {dogsMeta.map(dog => (
                            <Line
                                key={dog.id}
                                type="monotone"
                                dataKey={dog.key}
                                name={dog.name}
                                stroke={dog.color}
                                connectNulls
                                dot={false}
                                strokeWidth={2}
                                isAnimationActive={false}
                            />
                        ))}
                        <Brush
                            dataKey="label"
                            height={24}
                            startIndex={brushRange.startIndex}
                            endIndex={brushRange.endIndex}
                            onChange={(r: any) => setBrushRange({ startIndex: r?.startIndex, endIndex: r?.endIndex })}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}