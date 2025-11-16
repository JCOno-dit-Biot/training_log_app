
// conversion constants
export const KG_PER_LB = 0.45359237;
export const LB_PER_KG = 1 / KG_PER_LB;

export function kgToLb(kg: number): number {
    return kg * LB_PER_KG;
}
export function lbToKg(lb: number): number {
    return lb * KG_PER_LB;
}

export function convertWeight(value: number, from: 'kg' | 'lb', to: 'kg' | 'lb'): number {
    if (from === to) return value;
    return from === 'kg' ? kgToLb(value) : lbToKg(value);
}