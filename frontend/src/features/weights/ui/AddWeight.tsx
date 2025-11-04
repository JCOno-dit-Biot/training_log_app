import { useMemo, useState } from 'react';

import type { FetchWeightsParams } from '@/entities/dogs/model';

import { useCreateWeight } from '../model/useDogWeightMutations';

type Unit = 'kg' | 'lb';

export function AddWeight({
    dogId,
    listParams,
}: {
    dogId: number;
    listParams?: FetchWeightsParams;
}) {
    const [unit, setUnit] = useState<Unit>('kg');
    const [value, setValue] = useState<string>('');
    const [when, setWhen] = useState<string>(() => {
        const d = new Date();
        // yyyy-MM-ddTHH:mm (local)
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    });

    const { mutate, isPending } = useCreateWeight(listParams);

    const placeholder = unit === 'kg' ? 'e.g. 24.3' : 'e.g. 53.5';
    const toKg = (n: number) => (unit === 'kg' ? n : n / 2.2046226218);

    const disabled = useMemo(() => {
        const num = Number(value);
        return !dogId || !Number.isFinite(num) || num <= 0 || !when;
    }, [dogId, value, when]);

    function onSubmit() {
        const num = Number(value);
        if (disabled) return;
        const iso = new Date(when).toISOString();

        mutate({
            dog_id: dogId,
            date: iso,
            weight: Number(toKg(num).toFixed(3)),
        });

        setValue('');
        setWhen(new Date().toISOString().slice(0, 16)); // keep at current local minute
    }

    return (
        <div className="rounded-2xl border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold">Add weight</div>
                <div className="flex gap-2 text-sm">
                    <button
                        className={`px-3 py-1 rounded-xl border ${unit === 'kg' ? 'bg-gray-100' : ''}`}
                        onClick={() => setUnit('kg')}
                    >kg</button>
                    <button
                        className={`px-3 py-1 rounded-xl border ${unit === 'lb' ? 'bg-gray-100' : ''}`}
                        onClick={() => setUnit('lb')}
                    >lb</button>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[180px]">
                    <label className="text-sm block mb-1">Weight ({unit})</label>
                    <input
                        className="w-full border rounded-xl px-3 py-2"
                        inputMode="decimal"
                        value={value}
                        placeholder={placeholder}
                        onChange={e => setValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && onSubmit()}
                    />
                </div>

                <div>
                    <label className="text-sm block mb-1">Date & time</label>
                    <input
                        type="datetime-local"
                        className="border rounded-xl px-3 py-2"
                        value={when}
                        onChange={e => setWhen(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && onSubmit()}
                    />
                </div>

                <button
                    className="rounded-2xl px-4 py-2 shadow border disabled:opacity-50"
                    onClick={onSubmit}
                    disabled={isPending || disabled}
                    title="Enter to submit"
                >
                    Save
                </button>
            </div>
        </div>
    );
}
