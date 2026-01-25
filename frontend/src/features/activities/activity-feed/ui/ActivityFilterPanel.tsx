import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import type { ActivityFilter } from '@entities/activities/model';
import type { Dog } from '@entities/dogs/model';
import type { Runner } from '@entities/runners/model';
import type { Sport } from '@entities/sports/model';
import { cn } from "@/shared/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { useLocations } from '../../activity-editor/model/useLocations';
import { LocationCombobox } from "../../activity-editor/ui/LocationCombobox";

type Props = {
  filters: ActivityFilter;
  setFilters: React.Dispatch<React.SetStateAction<ActivityFilter>>;
  runners: Map<number, Runner>;
  dogs: Map<number, Dog>;
  sports: Map<number, Sport>;
  onApply: () => void;
  onClear: () => void;
};

function toDateOrUndefined(iso?: string) {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function toISODateOrUndefined(d?: Date) {
  if (!d) return undefined;
  // keep it as YYYY-MM-DD for your existing backend filter shape
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ActivityFilterPanel({
  filters,
  setFilters,
  runners,
  dogs,
  sports,
  onApply,
  onClear,
}: Props) {

  const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/?d=mp';

  const { byId: locations, isLoading: isLocationsLoading } = useLocations();

  const startDate = toDateOrUndefined(filters.start_date);
  const endDate = toDateOrUndefined(filters.end_date);

  const toggleRunner = (id: number) => {
    setFilters((f) => ({ ...f, runner_id: f.runner_id === id ? undefined : id }));
  };

  const toggleDog = (id: number) => {
    setFilters((f) => ({ ...f, dog_id: f.dog_id === id ? undefined : id }));
  };
  return (
    <div className="space-y-5">
      {/* Runner selector */}
      <div className="space-y-2">
        <Label>Runner</Label>
        <div className="flex flex-wrap gap-2">
          {[...runners.entries()].map(([id, runner]) => {
            const selected = filters.runner_id === id;
            return (
              <Button
                key={id}
                type="button"
                variant={selected ? "secondary" : "ghost"}
                onClick={() => toggleRunner(id)}
                className={cn(
                  "h-12 px-2 rounded-full border",
                  selected ? "border-primary" : "border-transparent"
                )}
                title={runner.name}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage
                      src={
                        runner?.image_url
                          ? `/profile_picture/runners/${runner.image_url}`
                          : DEFAULT_AVATAR
                      }
                      alt={runner.name}
                    />
                    <AvatarFallback>{runner.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{runner.name}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Dog selector */}
      <div className="space-y-2">
        <Label>Dog</Label>
        <div className="flex flex-wrap gap-2">
          {[...dogs.entries()].map(([id, dog]) => {
            const selected = filters.dog_id === id;
            return (
              <Button
                key={id}
                type="button"
                variant={selected ? "secondary" : "ghost"}
                onClick={() => toggleDog(id)}
                className={cn(
                  "h-12 px-2 rounded-full border",
                  selected ? "border-primary" : "border-transparent"
                )}
                title={dog.name}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage
                      src={dog.image_url ? `/profile_picture/dogs/${dog.image_url}` : DEFAULT_AVATAR}
                      alt={dog.name}
                    />
                    <AvatarFallback>{dog.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{dog.name}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Sport */}
      <div className="space-y-2">
        <Label>Sport</Label>
        <Select
          value={filters.sport_id ? String(filters.sport_id) : "all"}
          onValueChange={(v) =>
            setFilters((f) => ({
              ...f,
              sport_id: v === "all" ? undefined : Number(v),
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All sports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sports</SelectItem>
            {[...sports.entries()].map(([id, sport]) => (
              <SelectItem key={id} value={String(id)}>
                {sport.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location */}

      <div className="space-y-2">
        <Label>Location</Label>
        <LocationCombobox
          locations={locations}
          value={filters.location_id ?? null}
          onChange={(id) => setFilters((f) => ({ ...f, location_id: id ?? undefined }))}
          placeholder={isLocationsLoading ? "Loading..." : "Search a location…"}
          disabled={isLocationsLoading}
        />
      </div>


      {/* Dates */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Start date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
              >
                <CalendarIcon className="h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[92vw] max-w-[200px] p-0" align="start">
              <Calendar
                className="w-full [--cell-size:2.5rem]"
                mode="single"
                selected={startDate}
                onSelect={(d) =>
                  setFilters((f) => ({
                    ...f,
                    start_date: toISODateOrUndefined(d),
                  }))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
              >
                <CalendarIcon className="h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[200px] p-0" align="end">
              <Calendar
                className="w-full [--cell-size:2.5rem]"
                mode="single"
                selected={endDate}
                onSelect={(d) =>
                  setFilters((f) => ({
                    ...f,
                    end_date: toISODateOrUndefined(d),
                  }))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onClear}>
          Clear
        </Button>
        <Button type="button" onClick={onApply}>
          Apply filters
        </Button>
      </div>
    </div >
  );
}