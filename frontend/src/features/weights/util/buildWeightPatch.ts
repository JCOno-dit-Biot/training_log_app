import type { LatestWeight, WeightPatch } from "@/entities/dogs/model";

import { convertWeight } from "./convertUnit";

type Unit = 'kg' | 'lb';

export function buildWeightPatch(
    original: LatestWeight,
    unit: Unit,
    weightInput: string,
    dateInput: string,
): WeightPatch {
    const patch: WeightPatch = {};

    // weight
    const wTrimmed = weightInput.trim();
    if (wTrimmed !== '') {
        const num = Number(wTrimmed);
        if (Number.isFinite(num)) {
            // convert to kg because backend stores kg
            const weightKg =
                unit === 'kg'
                    ? num
                    : Number(convertWeight(num, 'lb', 'kg').toFixed(3));

            if (weightKg !== original.latest_weight) {
                patch.weight = weightKg;
            }
        }
    }

    // date
    const dTrimmed = dateInput.trim();
    if (dTrimmed !== '' && dTrimmed !== original.latest_update) {
        // assuming original.date is also "YYYY-MM-DD"
        patch.date = dTrimmed;
    }

    return patch;
}
