import React, { useState } from 'react';
import { Pencil } from 'lucide-react';

import type { Dog } from '@entities/dogs/model';
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"

import EditDogModal from './EditDogModal';

interface DogCardProps {
  dog: Dog;
  // onUpdateDog: (dogId: string, patch: Partial<Dog>) => Promise<void>;
}

function formatDOB(dateOfBirth?: string | null) {
  if (!dateOfBirth) return "Unknown"
  // expecting YYYY-MM-DD
  const parts = dateOfBirth.split("-")
  if (parts.length !== 3) return "Unknown"
  const [y, m, d] = parts
  const dt = new Date(`${m}/${d}/${y}`)
  if (Number.isNaN(dt.getTime())) return "Unknown"
  return dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

function safeBorderColor(color?: string | null) {
  // Only allow hex colors here as it is used directly in styling
  if (!color) return "#9ca3af"
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color) ? color : "#9ca3af"
}

export default function DogCard({ dog }: DogCardProps) {
  const dobFormatted = formatDOB(dog.date_of_birth)
  // modal states
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card className="relative min-h-40 w-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="truncate text-base font-semibold">
                  {dog.name}
                </CardTitle>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(true)}
                  aria-label={`Edit ${dog.name}`}
                  className="h-5 w-5 p-0 mb-1 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-1 w-1" />
                </Button>
              </div>

              <CardDescription className="truncate">
                {dog.breed || "—"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="absolute bottom-3 right-4 text-xs text-muted-foreground">
            DOB: {dobFormatted}
          </p>
        </CardContent>

        <img
          src={dog.image_url}
          alt={dog.name}
          className="absolute right-4 top-4 h-25 w-25 rounded-full border-4 bg-muted object-cover"
          style={{ borderColor: safeBorderColor(dog.color) }}
        />
      </Card>

      <EditDogModal dog={dog} open={open} onOpenChange={setOpen} />
    </>
  )
}