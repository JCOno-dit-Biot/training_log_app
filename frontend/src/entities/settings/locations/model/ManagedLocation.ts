export interface ManagedLocation {
    id: number
    name: string
    latitude: number | null
    longitude: number | null
    usage_count: number
}

export type LocationPatch = {
    name?: string
    latitude?: number | null
    longitude?: number | null
}