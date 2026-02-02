import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import type { Location } from "@/entities/activities/model";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/shared/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { formatLocationLabel } from "@/shared/util/formatLocationLabel";

type Props = {
    locations: Map<number, Location>;
    value: number | null; // selected location_id
    onChange: (id: number | null) => void;

    placeholder?: string;
    disabled?: boolean;

    allowCreateOption?: boolean;
    onCreateNew?: (name: string) => Promise<{ ok: boolean }>;
    maxResults?: number;
};

export function LocationCombobox({
    locations,
    value,
    onChange,
    placeholder = "Search a location…",
    disabled,
    allowCreateOption = false,
    onCreateNew,
    maxResults = 10
}: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    // Flatten map -> array once, format label once, stable ordering by id
    const allLocations = useMemo(() => {
        const arr = [...(locations?.entries?.() ?? [])]
            .map(([id, loc]) => ({ id, ...loc }))
            .filter((l): l is Location & { id: number } => !!l && typeof l.name === "string")
            .sort((a, b) => a.id - b.id)
            .map((l) => ({ ...l, name: formatLocationLabel(l.name) }));

        return arr;
    }, [locations]);

    const selected = useMemo(() => {
        if (value == null) return null;
        // Prefer Map lookup; fallback to array find if needed
        const fromMap = locations.get(value);
        return fromMap ? { ...fromMap, id: value, name: formatLocationLabel(fromMap.name) } : null;
    }, [value, locations]);

    // When popover closes, show the selected value (like your current component)
    useEffect(() => {
        if (!open) setQuery(selected?.name ?? "");
    }, [open, selected?.name]);

    const trimmed = query.trim();

    const canCreate = useMemo(() => {
        if (!allowCreateOption) return false;
        if (!trimmed) return false;
        const lower = trimmed.toLowerCase();
        return !allLocations.some((l) => l.name.toLowerCase() === lower);
    }, [allowCreateOption, trimmed, allLocations]);

    async function handleCreate() {
        if (!onCreateNew || !trimmed) return;
        try {
            await onCreateNew(trimmed);
        } finally {
            setOpen(false);
        }
    }

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const base = q
            ? allLocations.filter((l) => l.name.toLowerCase().includes(q))
            : allLocations;
        return base.slice(0, maxResults);
    }, [allLocations, query, maxResults]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className="w-full bg-background justify-between font-normal"
                >
                    {selected ? selected.name : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={placeholder}
                        value={query}
                        onValueChange={(v) => {
                            setQuery(v);
                            if (value != null) onChange(null);
                        }}
                    />
                    <CommandList>
                        <CommandEmpty>No matches</CommandEmpty>

                        <CommandGroup>
                            {filtered.map((loc) => (
                                <CommandItem
                                    key={loc.id}
                                    value={loc.name}
                                    onSelect={() => {
                                        onChange(loc.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === loc.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {loc.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>

                        {allowCreateOption && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        value={`__create__${trimmed}`}
                                        disabled={!canCreate || !onCreateNew}
                                        onSelect={() => {
                                            void handleCreate();
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        {trimmed ? `Add "${trimmed}"` : "Add new location"}
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
