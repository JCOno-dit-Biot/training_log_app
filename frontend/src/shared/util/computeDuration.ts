export function computeDuration({
    distanceKm,
    speedKmh,
    paceMinPerKm,
}: {
    distanceKm?: number | null
    speedKmh?: number | null
    paceMinPerKm?: string | null
}): string | null {
    if (!distanceKm || distanceKm <= 0) return null

    let totalSeconds: number | null = null

    // Case 1: speed (km/h)
    if (speedKmh && speedKmh > 0) {
        totalSeconds = (distanceKm / speedKmh) * 3600
    }

    // Case 2: pace (min/km) – takes precedence if provided
    if (paceMinPerKm && Number(paceMinPerKm) > 0) {
        totalSeconds = Number(paceMinPerKm) * distanceKm * 60
    }

    if (!totalSeconds || !Number.isFinite(totalSeconds)) return null

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.round(totalSeconds % 60)

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    }

    return `${minutes}:${String(seconds).padStart(2, "0")}`
}
