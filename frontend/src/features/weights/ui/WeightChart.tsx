import { useEffect, useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { CartesianGrid, Label, Legend, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { Dog } from '@/entities/dogs/model';
import type { WeightEntry } from '@/entities/dogs/model/Weight';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { Button } from "@/shared/ui/button"
import { parseYMD } from '@/shared/util/dates';

import { convertWeight } from '../util/convertUnit';
type Unit = 'kg' | 'lb';
type Preset = '90d' | 'ytd' | '1y' | 'all';


function fmtTick(ymd: string, preset: Preset) {
    if (preset === 'all') return ymd.slice(0, 4);
    const dt = parseYMD(ymd);
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(dt);
}
function fmtTooltipLabel(ymd: string) {
    const dt = parseYMD(ymd);
    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(dt);
}


function pivotWide(entries: WeightEntry[], unit: Unit, dogs: Dog[]) {
    const dates = Array.from(new Set(entries.map(e => e.date))).sort();

    const nameMap = new Map(dogs.map(d => [d.id, d.name]));
    const colorMap = new Map(dogs.map((d, i) => [d.id, d.color]));

    // rows with numeric idx and string label
    const rows = dates.map((label, idx) => ({ idx, label } as Record<string, number | string>));

    // map date to an index
    const indexOf = new Map(dates.map((d, i) => [d, i]));

    const labelByIdx = new Map(rows.map(r => [r.idx as number, r.label as string]));


    const dogIds: number[] = [];
    // TODO: check is seen is strictly necessary
    const seen = new Set<number>();

    for (const e of entries) {
        const dogId = e.dog?.id ?? (e as any).dog_id ?? (e as any).dogId;
        if (dogId == null) continue;

        if (!seen.has(dogId)) { seen.add(dogId); dogIds.push(dogId); }

        const i = indexOf.get(e.date);
        if (i == null) continue;

        const v = convertWeight(e.weight, 'kg', unit);
        // build a wide table: each date is linked to dog "columns"
        (rows[i] as any)[`dog_${dogId}`] = Number(v.toFixed(2));
    }

    // create some metadata from the dogs for lables, dp colours etc
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
    const [selecting, setSelecting] = useState(false);

    // check if user is on smartphone
    const isSmUp = useMediaQuery("(min-width: 640px)")

    const { rows, dogsMeta, labelByIdx } = useMemo(() => pivotWide(entries, unit, dogs), [entries, unit, dogs]);

    // Clear zoom anytime the preset changes (go back to preset domain)
    useEffect(() => { setXDomain(null); }, [preset]);

    // ensure we restore userSelect on cancel/leave
    useEffect(() => {
        return () => { document.body.style.userSelect = ''; };
    }, []);


    const onDown = (e: any) => {
        if (e && e.activeLabel != null) {
            setLeft(e.activeLabel as number);
            setSelecting(true);
            document.body.style.userSelect = 'none'; // disable selection globally
        }
    };

    const onMove = (e: any) => {
        if (left != null && e && e.activeLabel != null) setRight(e.activeLabel as number);
    };

    const finishDrag = () => {
        if (left != null && right != null) commitZoom(left, right);
        setSelecting(false);
        document.body.style.userSelect = ''; // re-enable selection
    };

    const cancelDrag = () => {
        setLeft(null);
        setRight(null);
        setSelecting(false);
        document.body.style.userSelect = '';
    };

    const resetSelection = () => { setLeft(null); setRight(null); };
    const commitZoom = (l: number, r: number) => {
        const [min, max] = l < r ? [l, r] : [r, l];
        if (min === max) { resetSelection(); return; }
        setXDomain([min, max]);
        resetSelection();
    };

    const resetZoom = () => setXDomain(null);

    return (<>
        <div className={`relative w-full h-full min-h-[280px] relative ${selecting ? "select-none cursor-col-resize" : ""}`}>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-40 top-2 z-10 h-8 w-8 backdrop-blur"
                onClick={resetZoom}
                aria-label="Reset zoom"
                title="Reset zoom"
                hidden={xDomain === null}
            >
                <RotateCcw className="h-4 w-4" />
            </Button>

            <ResponsiveContainer>
                <LineChart
                    data={rows}
                    margin={isSmUp ? { top: 10, right: 60, bottom: 10, left: 20 } : { top: 10, right: 20, bottom: 10, left: 20 }}
                    onMouseDown={onDown}
                    onMouseMove={onMove}
                    onMouseUp={finishDrag}
                    onMouseLeave={cancelDrag}
                >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                        type="number"
                        dataKey="idx"
                        allowDataOverflow
                        domain={xDomain ?? ["dataMin", "dataMax"]}
                        tickFormatter={(x: number) => {
                            const label = labelByIdx.get(Math.round(x)) ?? ""
                            return fmtTick(label, preset)
                        }}
                    />

                    <YAxis>
                        <Label
                            value={`Weight (${unit})`}
                            angle={-90}
                            position="insideLeft"
                            offset={10}
                            style={{ textAnchor: "middle" }}
                        />
                    </YAxis>

                    <Tooltip
                        labelFormatter={(idx: number) => {
                            const label = rows[idx]?.label as string
                            return fmtTooltipLabel(label)
                        }}
                        formatter={(value: any, _name: string, props: any) => [`${value} ${unit}`, props?.name]}
                    />

                    <Legend
                        layout={isSmUp ? "vertical" : "horizontal"}
                        verticalAlign={isSmUp ? "middle" : "bottom"}
                        align={isSmUp ? "right" : "center"}
                        wrapperStyle={
                            isSmUp
                                ? { right: "0%", top: "40%", transform: "translateY(-50%)", width: 100 }
                                : { paddingTop: 8, right: "0%" }
                        }
                        iconType="circle"
                    />


                    {dogsMeta.map((d) => (
                        <Line
                            key={d.id}
                            type="monotone"
                            dataKey={d.key}
                            name={d.name}
                            stroke={d.color}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                            connectNulls
                            isAnimationActive={false}
                        />
                    ))}

                    {left != null && right != null && (
                        <ReferenceArea x1={left} x2={right} strokeOpacity={0.3} fill="grey" fillOpacity={0.5} />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    </>
    )
}