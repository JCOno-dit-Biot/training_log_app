// clusterUtils.ts
import type L from 'leaflet';

export function sumClusterWeight(cluster: L.MarkerCluster): number {
    const markers = cluster.getAllChildMarkers() as Array<L.Marker & { options: any }>;

    return markers.reduce((acc, m) => {
        const w = Number(m.options.weight ?? 0);
        return acc + (Number.isFinite(w) ? w : 0);
    }, 0);
}
