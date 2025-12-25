import { useMemo, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type { Dog } from "@/entities/dogs/model";

import { type WeeklyMileageSeries } from "../../model/useWeeklyMileage";
import type { Row } from "../../utils/rollingAverage";

import { MileageTooltip } from "./MileageChartTooltip";


function dogKey(id: number) {
    return `dog_${id}`;
}

function formatWeekLabel(iso: string) {
    const mm = iso.slice(5, 7);
    const dd = iso.slice(8, 10);
    return `${mm}/${dd}`;
}

function buildRows(series: WeeklyMileageSeries) {
    const dogs = Object.values(series.byDog ?? {})
        .map((d) => ({ id: d.dog_id, name: d.dog_name, key: dogKey(d.dog_id) }))
        .sort((a, b) => a.id - b.id);

    const weekSet = new Set<string>();
    for (const p of series.allDogs ?? []) weekSet.add(p.week_start);
    for (const d of Object.values(series.byDog ?? {})) {
        for (const p of d.points ?? []) weekSet.add(p.week_start);
    }
    const weeks = Array.from(weekSet).sort((a, b) => a.localeCompare(b));

    const rows: Row[] = weeks.map((w) => {
        const r: Row = { week_start: w, total: 0 };
        for (const d of dogs) r[d.key] = 0;
        return r;
    });

    const byWeek = new Map(rows.map((r) => [r.week_start, r]));

    for (const d of Object.values(series.byDog ?? {})) {
        const key = dogKey(d.dog_id);
        for (const p of d.points ?? []) {
            const row = byWeek.get(p.week_start);
            if (row) row[key] = p.distance_km;
        }
    }

    for (const r of rows) {
        let t = 0;
        for (const d of dogs) t += Number(r[d.key] ?? 0);
        r.total = t;
    }

    return { rows, dogs };
}

function Legend({
    dogs,
    hidden,
    toggle,
    colorForDogId,
}: {
    dogs: { id: number; name: string; key: string }[];
    hidden: Set<string>;
    toggle: (key: string) => void;
    colorForDogId: (id: number) => string;
}) {
    return (
        <div className="flex flex-col gap-2">
            {dogs.map((d) => {
                const isHidden = hidden.has(d.key);
                return (
                    <button
                        key={d.key}
                        type="button"
                        onClick={() => toggle(d.key)}
                        className={`flex items-center gap-2 rounded-md border px-2 py-1 text-xs transition
              ${isHidden ? "opacity-50 hover:opacity-80" : "hover:bg-muted"}`}
                        title={isHidden ? "Show" : "Hide"}
                    >
                        <span
                            className="h-2 w-2 rounded-sm"
                            style={{ backgroundColor: colorForDogId(d.id) }}
                        />
                        <span className="max-w-[40px] truncate">{d.name}</span>
                    </button>
                );
            })}
        </div>
    );
}

export function WeeklyMileageStackedArea({
    data,
    loading,
    dogsData
}: {
    data?: WeeklyMileageSeries;
    loading?: boolean;
    dogsData?: Dog[];
}) {


    // Build a map dog_id -> color (field names may need tweaks)
    const dogColorMap = useMemo(() => {
        const m = new Map<number, string>();
        for (const d of dogsData ?? []) {
            // adjust: d.id, d.dog_id, d.color, d.ui_color, etc.
            m.set(d.id, d.color);
        }
        return m;
    }, [dogsData]);

    const colorForDogId = (id: number) => dogColorMap.get(id) ?? "currentColor";

    const { rows, dogs } = useMemo(() => {
        if (!data) return { rows: [] as Row[], dogs: [] as { id: number; name: string; key: string }[] };
        const built = buildRows(data);                // rows include "total"
        // optional rolling average
        // const rowsWithMA = addRollingAverage(built.rows, 4); // 4-week MA
        // add to return if using rows: rowsWithMA, 
        return built;
    }, [data]);

    const [hidden, setHidden] = useState<Set<string>>(new Set());

    const toggle = (key: string) => {
        setHidden((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            if (next.size === dogs.length) next.delete(key); // prevent hiding all
            return next;
        });
    };

    const visibleDogs = dogs.filter((d) => !hidden.has(d.key));

    if (loading) return <div className="h-full w-full animate-pulse rounded-md bg-muted" />;
    if (!data || rows.length === 0) return <div className="text-sm text-muted-foreground">No data</div>;

    return (
        <div className="flex h-full gap-3">
            <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={rows} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week_start" tickFormatter={formatWeekLabel} minTickGap={24} />
                        <YAxis width={40} tickFormatter={(v) => `${v}`} />

                        <Tooltip
                            content={
                                <MileageTooltip
                                    dogs={dogs}
                                    colorForDogId={colorForDogId}
                                />
                            }
                        />

                        {visibleDogs.map((d) => (
                            <Area
                                key={d.key}
                                type="monotone"
                                dataKey={d.key}
                                stackId="dogs"
                                stroke={colorForDogId(d.id)}
                                fill={colorForDogId(d.id)}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                                isAnimationActive={false}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="w-20 shrink-0">
                <div className="h-full overflow-auto pr-1 mt-10">
                    <Legend
                        dogs={dogs}
                        hidden={hidden}
                        toggle={toggle}
                        colorForDogId={colorForDogId}
                    />
                </div>
            </div>
        </div>
    );
}
