
type TP = {
    active?: boolean;
    payload?: Array<{
        dataKey?: string;
        value?: number;
        payload?: any; // the original datum
    }>;
};

function prettyTypeLabel(name: string) {
    const n = name.trim().toLowerCase();
    if (n === "dryland") return "Dryland";
    if (n === "on-snow" || n === "onsnow" || n === "snow") return "On Snow";
    return name;
}

export function DonutTooltip({
    active,
    payload,
}: TP) {
    if (!active || !payload || payload.length === 0) return null;

    const outer = payload.find((p) => p.dataKey === "outer_value" && p.value != null);
    const inner = payload.find((p) => p.dataKey === "inner_value" && p.value != null);
    const item = outer ?? inner ?? payload[0];

    const d = item.payload;
    const value = Number(item.value ?? 0);

    if (item.dataKey === "inner_value") {
        return (
            <div className="rounded-md border bg-background px-3 py-2 shadow-sm">
                <div className="text-sm font-medium">{prettyTypeLabel(d.name)}</div>
                <div className="text-xs text-muted-foreground">{value}</div>
            </div>
        );
    }

    // outer ring (sport)
    return (
        <div className="rounded-md border bg-background px-3 py-2 shadow-sm">
            <div className="text-sm font-medium">{d.name}</div>
            {/* optional type line */}
            <div className="text-xs text-muted-foreground">
                {d.type === "dryland" ? "Dryland" : "On Snow"} • {value}
            </div>
        </div>
    );
}