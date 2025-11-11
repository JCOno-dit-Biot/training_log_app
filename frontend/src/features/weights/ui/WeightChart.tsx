import { useMemo, useState } from 'react';
import { Brush, CartesianGrid, Label, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { Dog } from '@/entities/dogs/model';
import type { WeightEntry } from '@/entities/dogs/model/Weight';

import { convertWeight } from '../util/convertUnit';

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
    dogs,
}: {
    entries: WeightEntry[];
    unit: Unit;
    dogs: Dog[];
}) {
    // equally spaced x-axis: use category axis with label (no date math)
    const [brushRange, setBrushRange] = useState<{ startIndex?: number; endIndex?: number }>({});

    const { rows, dogsMeta } = useMemo(() => pivotWide(entries, unit, dogs), [entries, unit, dogs]);

    if (!rows.length) {
        return <div className="rounded-2xl border p-4 text-sm text-gray-500">No data to show.</div>;
    }

    return (
        <div className="rounded-2xl p-4 overflow-hidden">
            {/* <div className="flex items-center justify-between mb-2">
                    <button
                        className="ml-3 px-3 py-1 rounded-xl border"
                        onClick={() => setBrushRange({})}
                        title="Reset zoom"
                    >
                        Reset
                    </button>
                </div>
            </div> */}

            <div className="w-full h-[300px]">
                <ResponsiveContainer>
                    <LineChart data={rows} margin={{ top: 10, right: 30, bottom: 10, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        {/* category axis → equally spaced labels */}
                        <XAxis dataKey="label" />
                        <YAxis>
                            {/* Properly centered vertical label */}
                            <Label
                                value={`Weight (${unit})`}
                                angle={-90}
                                position="insideLeft"
                                offset={10}                 // nudge away from axis
                                style={{ textAnchor: 'middle' }}
                            />
                        </YAxis>
                        <Tooltip
                            formatter={(value: any) => [`${value} ${unit}`, 'Weight']}
                            labelFormatter={(label) => label}
                        />
                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{
                                right: 0,                  // anchor to the right padding
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 90,               // matches margin.right to avoid overlap
                            }}
                            iconType="circle"
                        />
                        {dogsMeta.map(d => (
                            <Line
                                key={d.id}
                                type="monotone"
                                dataKey={d.key}
                                name={d.name}
                                stroke={d.color}
                                strokeWidth={2}
                                dot={{ r: 3 }}      // show data points
                                activeDot={{ r: 5 }} // highlight hovered point
                                connectNulls          // skip gaps gracefully
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
                </ResponsiveContainer >
            </div >
        </div >
    );
}