import React, { useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';
import { toast } from "sonner"

import { diff } from '@shared/util/diffObject';
import type { Dog } from '@entities/dogs/model';
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"

import { useUpdateDog } from '../model/useDogs';

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
  const { mutate: updateDog } = useUpdateDog({ revalidate: true });


  const dobFormatted = formatDOB(dog.date_of_birth)

  // modal states
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // form states
  const [name, setName] = useState(dog.name ?? '');
  const [breed, setBreed] = useState(dog.breed ?? '');
  const [dob, setDob] = useState(dog.date_of_birth ?? '');
  const [color, setColor] = useState(dog.color ?? '');

  const formSnapshot = useMemo<Partial<Dog>>(
    () => ({
      id: dog.id,
      name,
      breed,
      date_of_birth: dob,
      color,
      image_url: dog.image_url ?? null,
    }),
    [dog.id, dog.image_url, name, breed, dob, color],
  );

  async function handleSave() {
    // very light validation
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }

    const patch = diff(dog, formSnapshot)
    if (Object.keys(patch).length === 0) {
      setOpen(false)
      return
    }

    setBusy(true)
    try {
      updateDog({ id: dog.id, diff: patch })
      setOpen(false)
      toast.success(`Saved changes for ${name.trim()}`)
    } catch (e) {
      console.error(e)
      toast.error("Failed to save changes. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  function openEditor() {
    // reset to current dog values before opening
    setName(dog.name ?? '');
    setBreed(dog.breed ?? '');
    setDob(dog.date_of_birth ?? '');
    setColor(dog.color ?? '');
    setOpen(true);
  }

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
                  onClick={openEditor}
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
          src={`/profile_picture/dogs/${dog.image_url}`}
          alt={dog.name}
          className="absolute right-4 top-4 h-25 w-25 rounded-full border-4 bg-muted object-cover"
          style={{ borderColor: safeBorderColor(dog.color) }}
        />
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Edit dog</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dog-name">Name</Label>
              <Input
                id="dog-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Bolt"
                disabled={busy}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dog-breed">Breed</Label>
              <Input
                id="dog-breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g., Labrador"
                disabled={busy}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dog-dob">Date of birth</Label>
              <Input
                id="dog-dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                disabled={busy}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dog-color">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="dog-color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#7f8c8d"
                  disabled={busy}
                />
                <Input
                  type="color"
                  aria-label="Pick color"
                  className="h-9 w-11 p-1"
                  value={safeBorderColor(color)}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={busy}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: use color picker or enter hex (e.g. #7f8c8d) for consistent UI.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}