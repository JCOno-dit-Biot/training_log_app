import { useMemo, useState } from 'react';

import type { FetchWeightsParams } from '@/entities/dogs/model';
import { useDogs } from '@/features/dogs/model/useDogs';
import { useLatestAll } from '@/features/weights/model/useDogWeightLatest';
import { useWeights } from '@/features/weights/model/useDogWeights';
import { LatestGrid } from '@/features/weights/ui/LatestGrid';
import { WeightsMultiChart } from '@/features/weights/ui/WeightChart';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Label } from "@/shared/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select"
import { Spinner } from '@/shared/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs"

type Unit = 'kg' | 'lb'
type Preset = "90d" | "ytd" | "1y" | "all"

export default function WeightsPage() {
    const [dogId, setDogId] = useState<number | undefined>();
    const [preset, setPreset] = useState<Preset>('90d');
    const [unit, setUnit] = useState<Unit>('lb');

    const { list: dogs } = useDogs();
    const { data: latest = [] } = useLatestAll();

    const sortedDogs = [...dogs].sort(
        (a, b) => new Date(a.date_of_birth).getTime() - new Date(b.date_of_birth).getTime(),
    );

    const range = useMemo(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const pad = (n: number) => String(n).padStart(2, '0');
        const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

        if (preset === 'all') return { start: undefined, end: undefined };
        if (preset === 'ytd') return { start: `${yyyy}-01-01`, end: undefined };

        const d = new Date(today);
        if (preset === '90d') d.setDate(d.getDate() - 90);
        if (preset === '1y') d.setFullYear(d.getFullYear() - 1);

        return { start: ymd(d), end: undefined };
    }, [preset]);

    const params = useMemo<FetchWeightsParams>(() => ({
        dogId,
        start_date: range.start,
        end_date: range.end,
    }), [dogId, range]);

    const { data = [], isLoading } = useWeights(params);

    const activeSecondary =
        "data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-none"

    return (
        <div className="h-screen w-full bg-neutral-25">
            <div className="mx-auto flex h-full w-full flex-col gap-3 px-4 py-6">
                {/* Row 1: Latest cards */}
                <LatestGrid latest={latest} dogs={sortedDogs} unit={unit} params={params} />

                {/* Row 2: Filters + chart */}
                <Card className="flex min-h-[450px] sm:min-h-[400px] h-full flex-1 flex-col">
                    <CardHeader className="pb-2">
                        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                            <CardTitle className="text-xl font-semibold leading-none">Weight trends</CardTitle>

                            <div className="flex w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-3 sm:justify-self-end">
                                {/* Dog Select */}
                                <div className="flex flex-col gap-1.5">
                                    <Label>Dog</Label>
                                    <Select
                                        value={dogId == null ? "all" : String(dogId)}
                                        onValueChange={(v) => setDogId(v === "all" ? undefined : Number(v))}
                                    >
                                        <SelectTrigger className="w-full sm:w-[180px] bg-neutral-25">
                                            <SelectValue placeholder="All dogs" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All dogs</SelectItem>
                                            {sortedDogs.map((d) => (
                                                <SelectItem key={d.id} value={String(d.id)}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Range Tabs */}
                                <div className="flex flex-col gap-1.5">
                                    <Label>Range</Label>
                                    <Tabs value={preset} onValueChange={(v) => setPreset(v as Preset)}>
                                        <TabsList className="w-full sm:w-auto sm:justify-start">
                                            <TabsTrigger value="90d" className={`flex-1 sm:flex-none ${activeSecondary}`}>90D</TabsTrigger>
                                            <TabsTrigger value="ytd" className={`flex-1 sm:flex-none ${activeSecondary}`}>YTD</TabsTrigger>
                                            <TabsTrigger value="1y" className={`flex-1 sm:flex-none ${activeSecondary}`}>1Y</TabsTrigger>
                                            <TabsTrigger value="all" className={`flex-1 sm:flex-none ${activeSecondary}`}>ALL</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>

                                {/* Unit Tabs */}
                                <div className="flex flex-col gap-1.5">
                                    <Label>Unit</Label>
                                    <Tabs value={unit} onValueChange={(v) => setUnit(v as Unit)}>
                                        <TabsList className="w-full sm:w-auto sm:justify-start">
                                            <TabsTrigger value="lb" className={`flex-1 sm:flex-none ${activeSecondary}`}>lb</TabsTrigger>
                                            <TabsTrigger value="kg" className={`flex-1 sm:flex-none ${activeSecondary}`}>kg</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="min-h-0 flex-1">
                        <div className="h-full min-h-0">
                            {isLoading ? (
                                <Spinner center text="Loading weights..." size={32} className="h-[330px] min-h-[330px]" />
                            ) : (
                                <WeightsMultiChart entries={data} unit={unit} dogs={sortedDogs} preset={preset} />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    )
}