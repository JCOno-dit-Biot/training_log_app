import React from "react";

import type { Dog } from "@entities/dogs/model";
import type { ActivityDogForm } from "@/entities/activities/model";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface DogTemperatureFieldsProps {
    selectedDogs: ActivityDogForm[];
    setSelectedDogs: (dogs: ActivityDogForm[]) => void;
    dogs: Map<number, Dog>;
}

export function DogTemperatureFields({
    selectedDogs,
    setSelectedDogs,
    dogs
}: DogTemperatureFieldsProps) {
    const updateDog = (dogId: number, patch: Partial<ActivityDogForm>) => {
        setSelectedDogs(
            selectedDogs.map((dog) =>
                dog.dog_id === dogId ? { ...dog, ...patch } : dog
            )
        );
    };
    return (
        <div className="rounded-md border bg-secondary/20 p-3">
            <div className="mb-3 text-sm font-medium">Dog temperatures</div>

            <div className="grid grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] gap-2 text-sm">
                <div className="font-semibold text-primary">Dog</div>
                <div className="font-semibold text-primary">Before</div>
                <div className="font-semibold text-primary">After</div>
                <div className="font-semibold text-primary">Recovery</div>
                <div className="font-semibold text-primary">Time</div>

                {selectedDogs.map((dogEntry) => {
                    const dog = dogs.get(dogEntry.dog_id);

                    return (
                        <React.Fragment key={dogEntry.dog_id}>
                            <div className="flex items-center text-sm font-medium">
                                {dog?.name ?? "Dog"}
                            </div>

                            <Input
                                type="number"
                                step="0.1"
                                placeholder="°C"
                                value={dogEntry.temperature_before ?? ""}
                                onChange={(e) =>
                                    updateDog(dogEntry.dog_id, {
                                        temperature_before: e.target.value,
                                    })
                                }
                                className="h-8 text-center text-sm"
                            />

                            <Input
                                type="number"
                                step="0.1"
                                placeholder="°C"
                                value={dogEntry.temperature_after ?? ""}
                                onChange={(e) =>
                                    updateDog(dogEntry.dog_id, {
                                        temperature_after: e.target.value,
                                    })
                                }
                                className="h-8 text-center text-sm"
                            />

                            <Input
                                type="number"
                                step="0.1"
                                placeholder="°C"
                                value={dogEntry.temperature_recovery ?? ""}
                                onChange={(e) =>
                                    updateDog(dogEntry.dog_id, {
                                        temperature_recovery: e.target.value,
                                    })
                                }
                                className="h-8 text-center text-sm"
                            />

                            <Input
                                type="number"
                                placeholder="min"
                                value={dogEntry.recovery_minute ?? ""}
                                onChange={(e) =>
                                    updateDog(dogEntry.dog_id, {
                                        recovery_minute: e.target.value,
                                    })
                                }
                                className="h-8 text-center text-sm"
                            />
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="flex gap-3 mt-3">
                <Select
                    value={selectedDogs[0]?.measurement_method ?? "ear"}
                    onValueChange={(value) => {
                        setSelectedDogs(
                            selectedDogs.map((dog) => ({
                                ...dog,
                                measurement_method: value,
                            }))
                        );
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select temperature measurement method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ear">Ear</SelectItem>
                        <SelectItem value="rectal">Rectal</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <Input
                    type="text"
                    placeholder="Cooling method, e.g. lake + walk"
                    value={selectedDogs[0]?.cooling_method ?? ""}
                    onChange={(e) => {
                        const value = e.target.value;
                        setSelectedDogs(
                            selectedDogs.map((dog) => ({
                                ...dog,
                                cooling_method: value,
                            }))
                        );
                    }}
                />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
                Applied to all selected dogs for this activity.
            </p>

        </div>
    );
}