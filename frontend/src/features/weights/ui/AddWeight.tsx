import { useMemo, useState } from 'react';

import type { FetchWeightsParams } from '@/entities/dogs/model';
import { toYMD } from '@/shared/util/dates';

import { useCreateWeight } from '../model/useDogWeightMutations';
import { convertWeight } from '../util/convertUnit';

type Unit = 'kg' | 'lb';

export function AddWeight({
    dogId,
    listParams,
}: {
    dogId: number;
    listParams?: FetchWeightsParams;
}) {
    const [unit, setUnit] = useState<Unit>('lb');
    const [value, setValue] = useState<string>('');
    const [date, setDate] = useState<string>(toYMD(new Date())); // yyyy-MM-dd

    const { mutate, isPending } = useCreateWeight(listParams);

    const placeholder = unit === 'kg' ? 'e.g. 24.3' : 'e.g. 53.5';
    //const toKg = (n: number) => (unit === 'kg' ? n : n / 2.2046226218);

    const disabled = useMemo(() => {
        const num = Number(value);
        return !dogId || !Number.isFinite(num) || num <= 0 || !date;
    }, [dogId, value, date]);

    function onSubmit() {
        const num = Number(value);
        if (disabled) return;
        const iso = new Date(date).toISOString();

        mutate({
            dog_id: dogId,
            date: iso,
            weight: Number(convertWeight(num, unit, "kg").toFixed(3)),
        });

        setValue('');
        setDate(toYMD(new Date()));
    }

    return (
        <div className="rounded-2xl border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold">Add weight</div>
                <div className="flex gap-2 text-sm">
                    <button
                        className={`px-3 py-1 rounded-xl border ${unit === 'kg' ? 'bg-gray-200' : ''}`}
                        onClick={() => setUnit('kg')}
                    >kg</button>
                    <button
                        className={`px-3 py-1 rounded-xl border ${unit === 'lb' ? 'bg-gray-200' : ''}`}
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
                        type="date"
                        className="border rounded-xl px-3 py-2"
                        value={date}
                        onChange={e => setDate(e.target.value)}
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
