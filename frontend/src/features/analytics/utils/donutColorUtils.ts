import { type SportType, TYPE_SHADES } from "@/entities/sports/model/Sport";

export function buildSportColorMap(
    outer: { name: string; value: number; type: SportType }[]
) {
    const map = new Map<string, string>();

    (["dryland", "on-snow"] as SportType[]).forEach((t) => {
        const shades = TYPE_SHADES[t];

        const items = outer
            .filter((s) => s.type === t)
            .slice()
            // rank: biggest first; stable tie-breaker by name
            .sort((a, b) => (b.value - a.value) || a.name.localeCompare(b.name));

        items.forEach((s, idx) => {
            // If you have more sports than shades, cycling is unavoidable.
            // But at least it cycles smoothly (dark->light->dark->light...) only after exhausting the palette.
            map.set(s.name, shades[idx % shades.length]);
        });
    });

    return map;
}

