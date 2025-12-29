import { useMemo, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';

import type { FetchWeightsParams, LatestWeight } from '@/entities/dogs/model';
import type { Dog } from '@/entities/dogs/model';
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { formatMonthDay } from '@/shared/util/dates';

import { convertWeight } from '../util/convertUnit'

import { AddWeightDialog, EditWeightDialog } from './WeightDialog';

type Unit = 'kg' | 'lb';

export function LatestGrid({
    latest,
    dogs,
    unit,
    params
}: {
    latest: LatestWeight[];
    dogs: Dog[];
    unit: Unit;
    params: FetchWeightsParams;
}) {
    const [openForDog, setOpenForDog] = useState<number | null>(null);
    const [editing, setEditing] = useState<LatestWeight | null>(null);

    const byDog = useMemo(() => new Map(latest.map(l => [l.dog_id, l])), [latest]);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                {dogs.map(d => {
                    const lw = byDog.get(d.id) ?? null;
                    const val = lw ? (unit === 'kg' ? lw.latest_weight : convertWeight(lw.latest_weight, 'kg', unit)) : null;
                    const delta = lw?.weight_change ?? null;
                    const deltaDisplay = delta == null ? null : (unit === 'kg' ? delta : convertWeight(delta, 'kg', unit));
                    const sign = deltaDisplay != null && deltaDisplay > 0 ? '▲' : deltaDisplay != null && deltaDisplay < 0 ? '▼' : '';
                    return (
                        <Card key={d.id} className="relative w-full">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 mt-1">
                                        <img
                                            src={`/profile_picture/dogs/${d.image_url}`}
                                            alt={d.name}
                                            className="h-20 w-20 rounded-full border-4 bg-muted object-cover mt-2"
                                            style={{ borderColor: d.color ?? "#9ca3af" }}
                                        />
                                        <CardTitle className="text-base font-semibold">{d.name}</CardTitle>
                                    </div>

                                    <div className="flex mt-0 items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => lw && setEditing(lw)}
                                            disabled={!lw}
                                            aria-label={`Edit latest weight for ${d.name}`}
                                            title={lw ? "Edit latest weight" : "No weight to edit"}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setOpenForDog(d.id)}
                                            aria-label={`Add weight for ${d.name}`}
                                            title="Add weight"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-2">
                                <div className="text-3xl font-bold tracking-tight">
                                    {val != null ? `${val.toFixed(1)} ${unit}` : "—"}
                                </div>

                                <div className="text-sm text-muted-foreground">
                                    {deltaDisplay != null ? (
                                        <span>
                                            {sign} {Math.abs(deltaDisplay).toFixed(1)} {unit} since last
                                        </span>
                                    ) : (
                                        "No previous data"
                                    )}
                                </div>

                                <div className="text-xs text-muted-foreground">
                                    {lw?.latest_update ? `Updated ${formatMonthDay(lw.latest_update)}` : "—"}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            {openForDog !== null && (
                <AddWeightDialog
                    open={openForDog !== null}
                    dogId={openForDog}
                    unit={unit}
                    params={params}
                    onClose={() => setOpenForDog(null)}
                />
            )}

            {/* Edit dialog */}
            {editing && (
                <EditWeightDialog
                    open={!!editing}
                    entry={editing}
                    unit={unit}
                    onClose={() => setEditing(null)}
                />
            )}
        </>
    );
}
