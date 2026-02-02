import { useEffect, useMemo, useState } from 'react';

import type { FetchWeightsParams, LatestWeight } from '@/entities/dogs/model';
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { toYMD } from '@/shared/util/dates';

import { useCreateWeight, useUpdateWeight } from '../model/useDogWeightMutations';
import { buildWeightPatch } from '../util/buildWeightPatch';
import { convertWeight } from '../util/convertUnit';

type Unit = 'kg' | 'lb';

type WeightFormValue = {
    weight: string;
    date: string; // yyyy-MM-dd
};

type WeightDialogProps = {
    open: boolean;
    title: string;
    unit: Unit;
    initial: WeightFormValue;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (value: WeightFormValue) => void;
};

function formatWeightForUnit(kg: number, unit: Unit): string {
    const val = unit === "kg" ? kg : convertWeight(kg, "kg", "lb");
    return val.toFixed(1);
}

function validate(weightStr: string, date: string, unit: Unit) {
    let invalidWeight = false
    let invalidDate = false

    const raw = Number(weightStr)
    if (!Number.isFinite(raw) || raw <= 0) invalidWeight = true

    const weightLbs = unit === "kg" ? convertWeight(raw, "kg", "lb") : raw
    if (weightLbs <= 0 || weightLbs > 200) invalidWeight = true

    const today = toYMD(new Date())
    if (!date || date > today) invalidDate = true

    return { invalidWeight, invalidDate, disabled: invalidWeight || invalidDate }
}


export function WeightDialog({
    open,
    title,
    unit,
    initial,
    loading = false,
    onClose,
    onSubmit,

}: WeightDialogProps) {

    const [value, setValue] = useState<string>('');
    const [date, setDate] = useState<string>(toYMD(new Date())); // yyyy-MM-dd

    const placeholder = unit === 'kg' ? 'e.g. 24.3' : 'e.g. 53.5';

    useEffect(() => {
        if (open) {
            setValue(initial.weight);
            setDate(initial.date);
        }
    }, [open, initial.weight, initial.date]);


    const { invalidWeight, invalidDate, disabled } = useMemo(
        () => validate(value, date, unit),
        [value, date, unit]
    );


    function handleSubmit() {
        if (disabled || loading) return;
        onSubmit({ weight: value, date });
        // don't clear local state here; it will reset on next open via `initial`
    }

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="weight">Weight ({unit})</Label>
                        <Input
                            id="weight"
                            inputMode="decimal"
                            placeholder={placeholder}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className={`bg-background ${invalidWeight && value ? "border-destructive" : ""}`}
                            disabled={loading}
                        />
                        {invalidWeight && value && (
                            <p className="text-xs text-destructive">Weight must be between 0–200 lb.</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={`bg-background ${invalidDate ? "border-destructive" : ""}`}
                            disabled={loading}
                        />
                        {invalidDate && <p className="text-xs text-destructive">Date cannot be in the future.</p>}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={loading || disabled}>
                        {loading ? "Saving…" : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function AddWeightDialog({
    open,
    dogId,
    unit,
    params,
    onClose,
}: {
    open: boolean
    dogId: number
    unit: Unit
    params: FetchWeightsParams
    onClose: () => void
}) {
    const { mutate, isPending } = useCreateWeight()

    const initial = useMemo(
        () => ({
            weight: "",
            date: toYMD(new Date()),
        }),
        []
    )

    const handleSubmit = ({ weight, date }: WeightFormValue) => {
        const num = Number(weight)
        const weightKg = Number(convertWeight(num, unit, "kg").toFixed(3))

        mutate(
            {
                input: { dog_id: dogId, date, weight: weightKg },
                listParams: params,
            },
            { onSuccess: onClose }
        )
    }

    return (
        <WeightDialog
            open={open}
            title="Add weight"
            unit={unit}
            initial={initial}
            loading={isPending}
            onClose={onClose}
            onSubmit={handleSubmit}
        />
    )
}

export function EditWeightDialog({
    open,
    entry,
    unit,
    onClose,
}: {
    open: boolean
    entry: LatestWeight | null
    unit: Unit
    onClose: () => void
}) {
    const { mutate, isPending } = useUpdateWeight()

    const initial = useMemo(
        () => ({
            weight: formatWeightForUnit(entry.latest_weight, unit),
            date: entry.latest_update.slice(0, 10),
        }),
        [entry.latest_weight, entry.latest_update, unit]
    )

    if (!entry) return null

    const handleSubmit = ({ weight, date }: WeightFormValue) => {
        const patch = buildWeightPatch(entry, unit, weight, date)
        if (Object.keys(patch).length === 0) {
            onClose()
            return
        }
        mutate({ id: entry.id, patch }, { onSuccess: onClose })
    }

    return (
        <WeightDialog
            open={open}
            title="Edit weight"
            unit={unit}
            initial={initial}
            loading={isPending}
            onClose={onClose}
            onSubmit={handleSubmit}
        />
    )
}