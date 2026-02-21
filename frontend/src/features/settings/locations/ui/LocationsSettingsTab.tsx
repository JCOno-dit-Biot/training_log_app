// src/features/settings/locations/ui/LocationsSettingsTab.tsx
import { useState } from "react"
import { MapPin, MapPinOff, MoreHorizontal } from "lucide-react"

import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Input } from "@/shared/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { formatLocationLabel } from "@/shared/util/formatLocationLabel"

import { useManagedLocations } from "../model/useManagedLocations"
function fmtCoord(v: number | null) {
  if (v === null || Number.isNaN(v)) return "—"
  return v.toFixed(6)
}

export function LocationsSettingsTab() {

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isLoading, error } = useManagedLocations(debouncedSearch)

  return (
    <div className="space-y-4">

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search locations…"
          />
        </div>

        <Button onClick={() => alert("TODO: open create location modal")}>
          Add location
        </Button>
      </div>

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Name</TableHead>
              <TableHead className="w-[12%]">GPS</TableHead>
              <TableHead className="w-[16%]">Latitude</TableHead>
              <TableHead className="w-[16%]">Longitude</TableHead>
              <TableHead className="w-[12%] text-right">Usage</TableHead>
              <TableHead className="w-[4%]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}

            {!isLoading && error && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-destructive">
                  {error}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !error && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No locations found.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !error &&
              data.map((loc) => {
                const hasGps = loc.latitude !== null && loc.longitude !== null
                return (
                  <TableRow key={loc.id}>
                    <TableCell className="font-medium">{formatLocationLabel(loc.name)}</TableCell>

                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs",
                          hasGps
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-amber-500/10 text-amber-700"
                        )}
                      >
                        {hasGps ? <MapPin className="h-3.5 w-3.5" /> : <MapPinOff className="h-3.5 w-3.5" />}
                        {hasGps ? "Set" : "Missing"}
                      </span>
                    </TableCell>

                    <TableCell className="font-mono text-sm">{fmtCoord(loc.latitude)}</TableCell>
                    <TableCell className="font-mono text-sm">{fmtCoord(loc.longitude)}</TableCell>

                    <TableCell className="text-right tabular-nums">{loc.usage_count}</TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => alert(`TODO: edit ${loc.id}`)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (loc.usage_count > 0) {
                                alert("TODO: archive (used by activities)")
                              } else {
                                alert("TODO: delete (unused)")
                              }
                            }}
                          >
                            {loc.usage_count > 0 ? "Archive" : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}