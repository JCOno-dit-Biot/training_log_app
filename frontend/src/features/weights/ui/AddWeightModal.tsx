import { useEffect, useMemo, useRef, useState } from 'react';

import type { FetchWeightsParams } from '@/entities/dogs/model';
import { toYMD } from '@/shared/util/dates';

import { useCreateWeight } from '../model/useDogWeightMutations';
import { convertWeight } from '../util/convertUnit';

type Unit = 'kg' | 'lb';

export function AddWeightModal({
    open,
    dogId,
    unit,
    params,
    onClose

}: {
    open: boolean;
    dogId: number;
    unit: Unit;
    params: FetchWeightsParams
    onClose: () => void;
}) {

    const [value, setValue] = useState<string>('');
    const [date, setDate] = useState<string>(toYMD(new Date())); // yyyy-MM-dd

    const ref = useRef<HTMLDivElement>(null);

    const { mutate, isPending } = useCreateWeight();

    const placeholder = unit === 'kg' ? 'e.g. 24.3' : 'e.g. 53.5';

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

        if (!dogId) {
            info.disabled = true;
            return info;
        }

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
    }, [dogId, value, date, unit]);


    function onSubmit() {
        if (disabled) return;

        const num = Number(value);
        const weightKg = Number(
            convertWeight(num, unit, "kg").toFixed(3)
        );

        mutate({
            input: {
                dog_id: dogId,
                date: date,          // or `date` depending on your API
                weight: weightKg,
            },
            listParams: params,
        },
            {
                onSuccess: () => {
                    onClose();
                    setValue('');
                    setDate(toYMD(new Date()));
                }
            },

        );
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div ref={ref} className="bg-white rounded-2xl w-full max-w-md p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-semibold">Add weight</div>
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
                    <button className="rounded-2xl px-4 py-2 shadow border disabled:opacity-50" disabled={isPending || disabled} onClick={onSubmit}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}