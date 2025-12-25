type TooltipPayloadItem = {
    dataKey?: string;
    value?: number;
    payload?: any;
};

export function MileageTooltip({
    active,
    payload,
    label,
    dogs,
    colorForDogId,
}: {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
    dogs: { id: number; name: string; key: string }[];
    colorForDogId: (id: number) => string;
}) {
    if (!active || !payload || payload.length === 0) return null;

    const byKey = new Map<string, number>();
    for (const p of payload) {
        if (p?.dataKey && typeof p.value === "number") byKey.set(p.dataKey, p.value);
    }

    const total =
        payload?.[0]?.payload?.total != null ? Number(payload[0].payload.total) : 0;

    const items = dogs
        .map((d) => ({ ...d, v: Number(byKey.get(d.key) ?? 0) }))
        .filter((x) => x.v > 0)
        .sort((a, b) => b.v - a.v);

    return (
        <div className="rounded-md border bg-background px-3 py-2 shadow-sm min-w-[220px]">
            <div className="text-sm font-medium">{label ? `Week of ${label}` : "Week"}</div>

            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Total</span>
                <span className="tabular-nums">{total.toFixed(1)} km</span>
            </div>

            {items.length > 0 && (
                <div className="mt-2 space-y-1">
                    {items.map((it) => (
                        <div key={it.key} className="flex items-center justify-between gap-3 text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    className="h-2.5 w-2.5 rounded-sm"
                                    style={{ backgroundColor: colorForDogId(it.id) }}
                                />
                                <span className="truncate">{it.name}</span>
                            </div>
                            <span className="tabular-nums text-muted-foreground">
                                {it.v.toFixed(1)} km
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}