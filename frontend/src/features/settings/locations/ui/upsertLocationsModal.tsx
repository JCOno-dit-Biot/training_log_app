import { useEffect, useMemo, useState } from "react"

import type { ManagedLocation } from "@/entities/settings/locations/model/ManagedLocation"
import { useCreateLocation } from "@/features/activities/activity-editor/model/useLocations"
import { BaseModal } from "@/shared/ui/base-modal"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"

import { useUpdateLocation } from "../model/useUpdateLocations"


type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    initial?: Pick<ManagedLocation, "id" | "name" | "latitude" | "longitude"> | null
}

function parseNullableFloat(v: string): number | null {
    const s = v.trim()
    if (!s) return null
    const n = Number(s)
    return Number.isFinite(n) ? n : NaN
}

function validateLatLng(lat: number | null, lng: number | null) {
    if (lat === null && lng === null) return null
    if (lat === null || lng === null) return "Provide both latitude and longitude, or leave both empty."
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "Latitude/longitude must be valid numbers."
    if (lat < -90 || lat > 90) return "Latitude must be between -90 and 90."
    if (lng < -180 || lng > 180) return "Longitude must be between -180 and 180."
    return null
}

export function UpsertLocationModal({ open, onOpenChange, initial }: Props) {
    const isEdit = !!initial?.id

    const [name, setName] = useState("")
    const [lat, setLat] = useState("") // keep as string for inputs
    const [lng, setLng] = useState("")
    const [formError, setFormError] = useState<string | null>(null)

    useEffect(() => {
        if (!open) return
        setFormError(null)
        setName(initial?.name ?? "")
        setLat(initial?.latitude ?? initial?.latitude === 0 ? String(initial.latitude) : "")
        setLng(initial?.longitude ?? initial?.longitude === 0 ? String(initial.longitude) : "")
    }, [open, initial])

    const payload = useMemo(() => {
        const latitude = parseNullableFloat(lat)
        const longitude = parseNullableFloat(lng)
        return { name: name.trim(), latitude, longitude }
    }, [name, lat, lng])

    const createMut = useCreateLocation()
    const updateMut = useUpdateLocation()

    const isSaving = createMut.isPending || updateMut.isPending

    function onSave() {
        setFormError(null)

        if (!payload.name) {
            setFormError("Name is required.")
            return
        }

        if (Number.isNaN(payload.latitude as any) || Number.isNaN(payload.longitude as any)) {
            setFormError("Latitude/longitude must be valid numbers.")
            return
        }

        const coordsError = validateLatLng(payload.latitude, payload.longitude)
        if (coordsError) {
            setFormError(coordsError)
            return
        }

        if (!isEdit) {
            createMut.mutate(
                { name: payload.name, latitude: payload.latitude, longitude: payload.longitude },
                {
                    onSuccess: () => onOpenChange(false),
                    onError: (e: any) => setFormError(e?.message ?? "Failed to create location."),
                },
            )
            return
        }

        if (!initial?.id) return

        updateMut.mutate(
            {
                id: initial.id,
                patch: {
                    name: payload.name,
                    latitude: payload.latitude,
                    longitude: payload.longitude,
                },
            },
            {
                onSuccess: () => onOpenChange(false),
                onError: (e: any) => setFormError(e?.message ?? "Failed to update location."),
            },
        )
    }

    return (
        <BaseModal
            open={open}
            onOpenChange={(v) => !isSaving && onOpenChange(v)}
            title={isEdit ? "Edit location" : "Add location"}
            description="Latitude/longitude are optional. If you enter one, enter both."
            footer={
                <div className="flex w-full items-center justify-end gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={onSave} disabled={isSaving}>
                        {isEdit ? "Save" : "Create"}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                {formError ? (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                        {formError}
                    </div>
                ) : null}

                <div className="space-y-2">
                    <Label htmlFor="loc-name">Name</Label>
                    <Input
                        id="loc-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Base trails"
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="loc-lat">Latitude</Label>
                        <Input
                            id="loc-lat"
                            inputMode="decimal"
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                            placeholder="e.g. 45.5019"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="loc-lng">Longitude</Label>
                        <Input
                            id="loc-lng"
                            inputMode="decimal"
                            value={lng}
                            onChange={(e) => setLng(e.target.value)}
                            placeholder="e.g. -73.5674"
                        />
                    </div>
                </div>
            </div>
        </BaseModal>
    )
}