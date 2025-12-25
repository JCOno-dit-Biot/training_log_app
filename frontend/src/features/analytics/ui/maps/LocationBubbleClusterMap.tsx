import { useCallback, useEffect, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';

import { formatLocationLabel } from '@/shared/util/formatLocationLabel';

import type { HeatmapPoint } from '../../model/useLocationHeatmap';
import { sumClusterWeight } from '../../utils/clusterUtils';

function FitBounds({ points, padding = 24, maxZoom = 13 }: {
    points: Array<{ lat: number; lng: number }>;
    padding?: number;
    maxZoom?: number;
}) {
    const map = useMap();

    useEffect(() => {
        const valid = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
        if (valid.length === 0) return;

        const bounds = L.latLngBounds(valid.map((p) => [p.lat, p.lng] as [number, number]));
        map.fitBounds(bounds, { padding: [padding, padding], maxZoom });
    }, [map, points, padding, maxZoom]);

    return null;
}

// sqrt scale: good for “count-like” metrics
function radiusFor(weight: number, maxWeight: number) {
    const min = 10;
    const max = 30;
    const t = Math.sqrt(Math.max(0, weight) / Math.max(1, maxWeight)); // 0..1
    return min + t * (max - min);
}

function bubbleIcon(radius: number, text: string) {
    const size = Math.round(radius * 2);
    return L.divIcon({
        className: 'bubble-marker',
        html: `<div class="bubble" style="width:${size}px;height:${size}px;"><span class="bubble-text">${text}</span></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

function quantile(sorted: number[], q: number) {
    if (sorted.length === 0) return 0;
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    const next = sorted[base + 1] ?? sorted[base];
    return sorted[base] + rest * next;
}

function computeThresholds(weights: number[]) {
    const sorted = weights
        .filter((n) => Number.isFinite(n))
        .slice()
        .sort((a, b) => a - b);

    return {
        mid: quantile(sorted, 0.6),
        high: quantile(sorted, 0.85),
    };
}

function clusterClass(total: number, thresholds: { mid: number, high: number }) {
    if (total >= thresholds.high) return 'cluster-high';
    if (total >= thresholds.mid) return 'cluster-mid';
    return 'cluster-low';
}

export function LocationBubbleClusterMap({
    data,
    height = 360,
}: {
    data: HeatmapPoint[];
    height?: number;
}) {
    const valid = useMemo(
        () => data.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)),
        [data]
    );

    const maxWeight = useMemo(
        () => Math.max(1, ...valid.map((p) => p.weight)),
        [valid]
    );

    const thresholds = useMemo(() => {
        const weights = valid.map((p) => p.weight);
        return computeThresholds(weights);
    }, [valid]);


    const iconCreateFunction = useCallback((cluster: any) => {
        const total = sumClusterWeight(cluster);
        const cls = clusterClass(total, thresholds);

        return L.divIcon({
            html: `<div class="cluster-bubble ${cls}"><span>${total}</span></div>`,
            className: 'cluster-icon', // keep outer class clean
            iconSize: L.point(44, 44),
        });
    }, [thresholds]);

    return (
        <div style={{ height }} className="w-full overflow-hidden z-0 isolate rounded-md border border-neutral-500">
            <MapContainer
                center={[45.4215, -75.6972]} // fallback; FitBounds will override
                zoom={10}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds points={valid.map((p) => ({ lat: p.lat, lng: p.lng }))} />

                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={iconCreateFunction}
                    showCoverageOnHover={false}
                    // optional: tweak clustering distance
                    maxClusterRadius={30}
                    disableClusteringAtZoom={13}
                >
                    {valid.map((p, idx) => {
                        const r = radiusFor(p.weight, maxWeight);
                        return (
                            <Marker
                                key={`${p.label}-${idx}`}
                                position={[p.lat, p.lng]}
                                icon={bubbleIcon(r, String(p.weight))}

                                // @ts-ignore
                                weight={p.weight}
                            >
                                <Tooltip direction="top" opacity={1}>
                                    <div className="text-sm font-medium">
                                        {formatLocationLabel(p.label)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {p.weight} trainings
                                    </div>
                                </Tooltip>
                            </Marker>
                        );
                    })}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
}
