import type { TooltipProps } from "recharts";

function prettyTypeLabel(name: string) {
    const n = name.trim().toLowerCase();
    if (n === "dryland") return "Dryland";
    if (n === "on-snow" || n === "onsnow" || n === "snow") return "On snow";
    return name;
}

export function DonutTooltip({
    active,
    payload,
}: TooltipProps<number, string>) {
    if (!active || !payload || payload.length === 0) return null;

    // Find the payload item that corresponds to the ring being hovered.
    const ringItem =
        payload.find((p: any) => p?.payload?.__ring) ?? payload[0];

    const p: any = ringItem.payload;
    const value = Number(ringItem.value ?? p.value ?? 0);

    if (p.__ring === "type") {
        return (
            <div className="rounded-md border bg-background px-3 py-2 shadow-sm">
                <div className="text-sm font-medium">{prettyTypeLabel(p.name)}</div>
                <div className="text-xs text-muted-foreground">{value}</div>
            </div>
        );
    }

    // outer ring (sport)
    return (
        <div className="rounded-md border bg-background px-3 py-2 shadow-sm">
            <div className="text-sm font-medium">{p.name}</div>
            <div className="text-xs text-muted-foreground">
                {p.type === "DRYLAND" ? "Dryland" : "On snow"} • {value}
            </div>
        </div>
    );
}
