import { useEffect, useMemo, useRef, useState } from 'react';

import type { FetchWeightsParams, LatestWeight } from '@/entities/dogs/model';
import { toYMD } from '@/shared/util/dates';

import { useCreateWeight, useUpdateWeight } from '../model/useDogWeightMutations';
import { buildWeightPatch } from '../util/buildWeightPatch';
import { convertWeight } from '../util/convertUnit';

type Unit = 'kg' | 'lb';

type WeightFormValue = {
    weight: string;
    date: string; // yyyy-MM-dd
};

type WeightModalProps = {
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

export function WeightModal({
    open,
    title,
    unit,
    initial,
    loading = false,
    onClose,
    onSubmit,

}: WeightModalProps) {

    const [value, setValue] = useState<string>('');
    const [date, setDate] = useState<string>(toYMD(new Date())); // yyyy-MM-dd

    const ref = useRef<HTMLDivElement>(null);

    //const { mutate, isPending } = useCreateWeight();

    const placeholder = unit === 'kg' ? 'e.g. 24.3' : 'e.g. 53.5';

    useEffect(() => {
        if (open) {
            setValue(initial.weight);
            setDate(initial.date);
        }
    }, [open, initial.weight, initial.date]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (!ref.current) return;

            // if click is outside the modal
            if (!ref.current.contains(e.target as Node)) {
                onClose();
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClick);
        }

        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [open, onClose]);

    const { invalidWeight, invalidDate, disabled } = useMemo(() => {
        const info = {
            invalidWeight: false,
            invalidDate: false,
            disabled: false,
        };

        // weight
        const raw = Number(value);
        if (!Number.isFinite(raw) || raw <= 0) {
            info.invalidWeight = true;
        }

        const weightLbs = unit === "kg"
            ? convertWeight(raw, "kg", "lb")
            : raw;

        if (weightLbs <= 0 || weightLbs > 200) {
            info.invalidWeight = true;
        }

        // date
        const today = toYMD(new Date());
        if (!date || date > today) {
            info.invalidDate = true;
        }

        info.disabled = info.invalidWeight || info.invalidDate;

        return info;
    }, [value, date, unit]);


    function handleSubmit() {
        if (disabled || loading) return;
        onSubmit({ weight: value, date });
        // we don't clear local state here; it will reset on next open via `initial`
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div ref={ref} className="bg-white rounded-2xl w-full max-w-md p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-semibold">{title}</div>
                    <button className="text-sm bg-white" onClick={onClose}>Close</button>
                </div>

                <div className="flex flex-col gap-3">
                    <div>
                        <label className="text-sm block mb-1">Weight ({unit})</label>
                        <input
                            className={`w-full border ${invalidWeight && value ? 'border-red-500' : ''} rounded-xl px-3 py-2`}
                            inputMode="decimal"
                            placeholder={placeholder}
                            value={value}
                            onChange={e => setValue(e.target.value)} />
                    </div>
                    {invalidWeight && value && <p className="text-xs text-red-600">Weight must be between 0–200 lb.</p>}
                    <div>
                        <label className="text-sm block mb-1">Date</label>
                        <input type="date" className={`w-full border ${invalidDate ? 'border-red-500' : ''} rounded-xl px-3 py-2`} value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    {invalidDate && <p className="text-xs text-red-600">Date cannot be in the future.</p>}
                    <button className="rounded-2xl px-4 py-2 shadow border disabled:opacity-50"
                        disabled={loading || disabled}
                        onClick={handleSubmit}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export function AddWeightModal({
    open,
    dogId,
    unit,
    params,
    onClose,
}: {
    open: boolean;
    dogId: number;
    unit: Unit;
    params: FetchWeightsParams;
    onClose: () => void;
}) {
    const { mutate, isPending } = useCreateWeight();

    const initial = useMemo(
        () => ({
            weight: "",
            date: toYMD(new Date()),
        }),
        [],
    );

    const handleSubmit = ({ weight, date }: { weight: string; date: string }) => {
        const num = Number(weight);
        const weightKg = Number(
            convertWeight(num, unit, "kg").toFixed(3),
        );

        mutate(
            {
                input: {
                    dog_id: dogId,
                    date,
                    weight: weightKg,
                },
                listParams: params,
            },
            {
                onSuccess: () => {
                    onClose();
                },
            },
        );
    };

    return (
        <WeightModal
            open={open}
            title="Add weight"
            unit={unit}
            initial={initial}
            loading={isPending}
            onClose={onClose}
            onSubmit={handleSubmit}
        />
    );
}

export function EditWeightModal({
    open,
    entry,
    unit,
    onClose,
}: {
    open: boolean;
    entry: LatestWeight;
    unit: Unit;
    onClose: () => void;
}) {
    const { mutate, isPending } = useUpdateWeight();

    const initial = useMemo(
        () => ({
            weight: formatWeightForUnit(entry.latest_weight, unit),
            date: entry.latest_update.slice(0, 10), // assuming ISO
        }),
        [entry, unit],
    );

    const handleSubmit = ({ weight, date }: { weight: string; date: string }) => {
        const patch = buildWeightPatch(entry, unit, weight, date); // as we discussed earlier
        if (Object.keys(patch).length === 0) {
            onClose();
            return;
        }

        mutate(
            { id: entry.id, patch },
            { onSuccess: onClose },
        );
    };

    return (
        <WeightModal
            open={open}
            title="Edit weight"
            unit={unit}
            initial={initial}
            loading={isPending}
            onClose={onClose}
            onSubmit={handleSubmit}
        />
    );
}