export type Row = {
    week_start: string;
    total: number;
    [key: string]: string | number;
};

export function addRollingAverage(rows: Row[], windowSize: number) {
    const out = rows.map((r) => ({ ...r, total_ma: null as number | null }));

    for (let i = 0; i < out.length; i++) {
        const start = Math.max(0, i - windowSize + 1);
        let sum = 0;
        let count = 0;

        for (let j = start; j <= i; j++) {
            const v = Number(out[j].total ?? 0);
            sum += v;
            count += 1;
        }

        out[i].total_ma = count > 0 ? sum / count : null;
    }

    return out;
}
