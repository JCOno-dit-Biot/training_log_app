import { useMemo, useState } from 'react';
import { CartesianGrid, Label, Legend, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { Dog } from '@/entities/dogs/model';
import type { WeightEntry } from '@/entities/dogs/model/Weight';

import { convertWeight } from '../util/convertUnit';

type Unit = 'kg' | 'lb';
type Preset = '90d' | 'ytd' | '1y' | 'all';

function parseYMDLocal(ymd: string) {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, m - 1, d);
}
function fmtTick(ymd: string, preset: Preset) {
    if (preset === 'all') return ymd.slice(0, 4);
    const dt = parseYMDLocal(ymd);
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(dt);
}
function fmtTooltipLabel(ymd: string) {
    const dt = parseYMDLocal(ymd);
    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(dt);
}


function pivotWide(entries: WeightEntry[], unit: Unit, dogs: Dog[]) {
    const dates = Array.from(new Set(entries.map(e => e.date))).sort();

    const nameMap = new Map(dogs.map(d => [d.id, d.name]));
    const colorMap = new Map(dogs.map((d, i) => [d.id, d.color]));

    // rows with numeric idx and string label
    const rows = dates.map((label, idx) => ({ idx, label } as Record<string, number | string>));

    // quick lookup
    const indexOf = new Map(dates.map((d, i) => [d, i]));
    const labelByIdx = new Map(rows.map(r => [r.idx as number, r.label as string]));

    const dogIds: number[] = [];
    const seen = new Set<number>();

    for (const e of entries) {
        const dogId = e.dog?.id ?? (e as any).dog_id ?? (e as any).dogId;
        if (dogId == null) continue;

        if (!seen.has(dogId)) { seen.add(dogId); dogIds.push(dogId); }

        const i = indexOf.get(e.date);
        if (i == null) continue;

        const v = convertWeight(e.weight, 'kg', unit);
        (rows[i] as any)[`dog_${dogId}`] = Number(v.toFixed(2));
    }

    const dogsMeta = dogIds.map((id) => ({
        id,
        key: `dog_${id}`,
        name: nameMap.get(id) ?? `Dog ${id}`,
        color: colorMap.get(id),
    }));

    return { rows, dogsMeta, labelByIdx };
}


export function WeightsMultiChart({
    entries,
    unit,
    dogs,
    preset
}: {
    entries: WeightEntry[];
    unit: Unit;
    dogs: Dog[];
    preset: Preset
}) {
    const [left, setLeft] = useState<number | null>(null);
    const [right, setRight] = useState<number | null>(null);
    const [xDomain, setXDomain] = useState<[number, number] | null>(null);

    const { rows, dogsMeta, labelByIdx } = useMemo(() => pivotWide(entries, unit, dogs), [entries, unit, dogs]);

    const resetSelection = () => { setLeft(null); setRight(null); };
    const commitZoom = (l: number, r: number) => {
        const [min, max] = l < r ? [l, r] : [r, l];
        if (min === max) { resetSelection(); return; }
        setXDomain([min, max]);
        resetSelection();
    };

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
                    <LineChart data={rows} margin={{ top: 10, right: 30, bottom: 10, left: 20 }}
                        onMouseDown={(e: any) => { if (e && e.activeLabel != null) setLeft(e.activeLabel as number); }}
                        onMouseMove={(e: any) => { if (left != null && e && e.activeLabel != null) setRight(e.activeLabel as number); }}
                        onMouseUp={() => { if (left != null && right != null) commitZoom(left, right); }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        {/* category axis → equally spaced labels */}
                        <XAxis
                            type="number"
                            dataKey="idx"
                            allowDataOverflow
                            domain={xDomain ?? ['dataMin', 'dataMax']}
                            tickFormatter={(x: number) => {
                                const label = labelByIdx.get(Math.round(x)) ?? '';
                                return fmtTick(label, preset);
                            }}
                        />
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
                            labelFormatter={(idx: number) => {
                                const label = rows[idx]?.label as string;
                                return fmtTooltipLabel(label);
                            }}
                            // show dog name as the series label
                            formatter={(value: any, _name: string, props: any) => [`${value} ${unit}`, props?.name]}
                        />
                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{
                                right: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 90,
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
                        {/* Drag selection overlay */}
                        {left != null && right != null && (
                            <ReferenceArea
                                x1={left}
                                x2={right}
                                strokeOpacity={0.3}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer >
            </div >
        </div >
    );
}