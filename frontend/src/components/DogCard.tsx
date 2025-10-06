import React, { useState, useMemo } from 'react';
import { Dog } from '../types/Dog';
import { diff } from '../functions/helpers/diffObject';
import { useUpdateDog } from '../hooks/useDogs';
import { Pencil } from 'lucide-react';

interface DogCardProps {
  dog: Dog;
  onUpdateDog: (dogId: string, patch: Partial<Dog>) => Promise<void>;
}

export default function DogCard({ dog }: DogCardProps) {

  const { mutate: updateDog, isPending } = useUpdateDog({ revalidate: true });

  // Format DOB and protect against malformed DOB
  const dobParts = (dog.date_of_birth ?? "").split("-");
  const dobFormatted =
    dobParts.length === 3
      ? new Date(`${dobParts[1]}/${dobParts[2]}/${dobParts[0]}`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
      : "Unknown";

  // modal states
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // form states
  const [name, setName] = useState(dog.name ?? "");
  const [breed, setBreed] = useState(dog.breed ?? "");
  const [dob, setDob] = useState(dog.date_of_birth ?? "");
  const [color, setColor] = useState(dog.color ?? "");


  const formSnapshot = useMemo<Partial<Dog>>(
    () => ({
      id: dog.id,
      name,
      breed,
      date_of_birth: dob,
      color,
      image_url: dog.image_url ?? null,
    }),
    [dog.id, dog.image_url, name, breed, dob, color]
  );


  async function handleSave() {
    // very light validation
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      alert("Date must be in YYYY-MM-DD format");
      return;
    }

    const patch = diff(dog, formSnapshot);
    if (Object.keys(patch).length === 0) {
      setOpen(false);
      return;
    }

    setBusy(true);
    try {
      updateDog({id: dog.id, diff: patch});
      setOpen(false);
      setSuccessMsg(`Successfully edited dog ${formSnapshot.name}`);
      setTimeout(() => setSuccessMsg(null), 4000); // auto-hide after 4s
    } catch (e) {
      console.error(e);
      alert("Failed to save changes. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function openEditor() {
    // reset to current dog values before opening
    setName(dog.name ?? "");
    setBreed(dog.breed ?? "");
    setDob(dog.date_of_birth ?? "");
    setColor(dog.color ?? "");
    setOpen(true);

  }

  return (
    <div className="relative flex flex-col justify-between border border-gray-300 rounded-xl shadow-md p-4 w-full sm:w-64 h-40 bg-white">
      
      {/* Top-left: name and breed */}
      <div className="text-left">
        <div className="flex gap-2">
        <h2 className="text-lg font-bold text-gray-800">{dog.name}</h2>
        <Pencil
        onClick={openEditor}
        aria-label={`Edit ${dog.name}`}
        className="w-3 h-3 text-gray-600 mt-1"
      >
      </Pencil>
      </div>
        <p className="text-sm text-gray-600">{dog.breed}</p>
      </div>
      <img
        src={`/profile_picture/dogs/${dog.image_url}`}
        alt={dog.name}
        className="absolute top-3 right-6 aspect-square w-auto h-25 rounded-full object-cover border-3 p-1"
        style={{ borderColor: dog.color ?? "#9ca3af" }} // fallback to gray
      />
      {/* Bottom-right: DOB */}
      <p className="absolute bottom-3 right-4 text-xs text-gray-500">
        DOB: {dobFormatted}
      </p>

      {/* Modal (headless, dependency-free) */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold">Edit Dog</h3>
              <button
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-sm text-gray-700">Name</span>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Bolt"
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-700">Breed</span>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  value={breed ?? ""}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="e.g., Labrador"
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-700">Date of Birth</span>
                <input
                  type="date"
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  value={dob ?? ""}
                  onChange={(e) => setDob(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-700">Color</span>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={color ?? ""}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#7f8c8d or 'Brown'"
                  />
                  <input
                    type="color"
                    aria-label="Pick color"
                    className="h-9 w-10 rounded-md border"
                    value={/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color || "") ? (color as string) : "#7f8c8d"}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-md border px-3 py-2 text-sm"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-primary px-3 py-2 text-sm text-white disabled:opacity-50"
                onClick={handleSave}
                disabled={busy}
              >
                {busy ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
      {successMsg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-auto max-w-md rounded bg-green-100 border border-green-400 text-green-700 px-4 py-2 shadow-md">
          {successMsg}
        </div>
      )}

    </div>
  );
}
