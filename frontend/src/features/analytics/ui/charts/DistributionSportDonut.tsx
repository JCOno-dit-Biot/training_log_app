import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { type SportType, TYPE_BASE, TYPE_SHADES } from "@/entities/sports/model/Sport";

import type { SportDistribution } from "../../model/useSportDistribution";
import { buildSportColorMap } from "../../utils/donutColorUtils";

import { DonutTooltip } from "./DonutTooltip";

const TYPE_ORDER: Record<SportType, number> = {
    "dryland": 0,
    "on-snow": 1,
};

function LegendSection({
    items,
}: {
    items: { label: string; color: string; value?: number; type: SportType }[];
}) {
    const dry = items.filter((i) => i.type === "dryland");
    const snow = items.filter((i) => i.type === "on-snow");
    return (
        <div className="space-y-4">
            {dry.length > 0 && (
                <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Dryland</div>
                    <ul className="space-y-1">
                        {dry.map((it) => (
                            <li key={it.label} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: it.color }} />
                                    <span className="text-sm truncate">{it.label}</span>
                                </div>
                                <span className="text-sm tabular-nums text-muted-foreground">{it.value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {snow.length > 0 && (
                <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">On Snow</div>
                    <ul className="space-y-1">
                        {snow.map((it) => (
                            <li key={it.label} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: it.color }} />
                                    <span className="text-sm truncate">{it.label}</span>
                                </div>
                                <span className="text-sm tabular-nums text-muted-foreground">{it.value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export function SportDistributionDonut({
    data,
    loading,
}: {
    data?: SportDistribution;
    loading?: boolean;
}) {
    console.log(data)

    const innerData = useMemo(
        () => data?.inner.map((s) => ({
            ...s,
            __ring: "type" as const,
            inner_value: s.value
        })) ?? [],
        [data]
    );

    const outerData = useMemo(
        () =>
            (data?.outer ?? []).map((s) => ({
                ...s,
                __ring: "sport" as const,
                outer_value: s.value,
            })),
        [data]
    );
    const colorMap = useMemo(
        () => (data ? buildSportColorMap(data.outer) : new Map<string, string>()),
        [data]
    );

    const legend = useMemo(() => {
        if (!data) return null;
        const cm = buildSportColorMap(data.outer);
        return data.outer
            .slice()
            .sort((a, b) => {
                const order = a.type === b.type ? 0 : a.type === "dryland" ? -1 : 1;
                if (order !== 0) return order;
                return (b.value - a.value) || a.name.localeCompare(b.name);
            })
            .map((s) => ({
                label: s.name,
                value: s.value,
                type: s.type,
                color: cm.get(s.name) ?? TYPE_SHADES[s.type][0],
            }));
    }, [data]);

    if (loading) return <div className="h-full w-full animate-pulse rounded-md bg-muted" />;
    if (!data || (data.outer?.length ?? 0) === 0) {
        return <div className="text-sm text-muted-foreground text-center">No activities in this range</div>;
    }

    return (
        <div className="flex h-full items-center gap-3">
            <div className="shrink-0">
                <div className="h-44 w-44 sm:h-48 sm:w-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip content={<DonutTooltip />} />

                            {/* Inner ring: sport type */}
                            <Pie
                                data={innerData}
                                dataKey="inner_value"
                                nameKey="name"
                                innerRadius="35%"
                                outerRadius="55%"
                                paddingAngle={2}
                                strokeWidth={1}
                            >
                                {innerData.map((slice) => (
                                    < Cell key={slice.name} fill={TYPE_BASE[slice.type]} />
                                ))}
                            </Pie>

                            {/* Outer ring: per sport */}
                            <Pie
                                data={outerData}
                                dataKey="outer_value"
                                nameKey="name"
                                innerRadius="62%"
                                outerRadius="85%"
                                paddingAngle={2}
                                strokeWidth={1}
                            >
                                {outerData.map((slice) => (
                                    <Cell
                                        key={slice.name}
                                        fill={colorMap.get(slice.name) ?? TYPE_SHADES[slice.type][0]}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="min-w-0 flex-1">
                <div className="space-y-4">
                    {legend && (
                        <>
                            <LegendSection items={legend} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
