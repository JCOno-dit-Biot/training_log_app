import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { diff } from "@shared/util/diffObject";
import type { Dog } from "@entities/dogs/model";
import { BaseModal } from "@/shared/ui/base-modal";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { useUpdateDog, useUploadDogPicture } from "../model/useDogs";

function safeBorderColor(color?: string | null) {
    if (!color) return "#9ca3af";
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color) ? color : "#9ca3af";
}

interface EditDogModalProps {
    dog: Dog;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EditDogModal({ dog, open, onOpenChange }: EditDogModalProps) {
    const { mutateAsync: updateDog } = useUpdateDog({ revalidate: true });
    const { mutateAsync: uploadDogPicture } = useUploadDogPicture();

    const [busy, setBusy] = useState(false);

    const [name, setName] = useState(dog.name ?? "");
    const [breed, setBreed] = useState(dog.breed ?? "");
    const [dob, setDob] = useState(dog.date_of_birth ?? "");
    const [color, setColor] = useState(dog.color ?? "");

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(dog.image_url ?? null);

    useEffect(() => {
        if (!open) return;

        setName(dog.name ?? "");
        setBreed(dog.breed ?? "");
        setDob(dog.date_of_birth ?? "");
        setColor(dog.color ?? "");
        setSelectedFile(null);
        setPreviewUrl(dog.image_url ?? null);
    }, [dog, open]);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const formSnapshot = useMemo<Partial<Dog>>(
        () => ({
            id: dog.id,
            name: name.trim(),
            breed: breed.trim(),
            date_of_birth: dob,
            color: color,
        }),
        [dog.id, name, breed, dob, color],
    );

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.");
            return;
        }

        if (previewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }

        const objectUrl = URL.createObjectURL(file);
        setSelectedFile(file);
        setPreviewUrl(objectUrl);
    }

    function handleClose() {
        if (busy) return;
        onOpenChange(false);
    }

    async function handleSave() {
        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        const patch = diff(
            {
                id: dog.id,
                name: dog.name ?? "",
                breed: dog.breed ?? null,
                date_of_birth: dog.date_of_birth ?? null,
                color: dog.color ?? null,
            },
            formSnapshot,
        );

        const hasDogChanges = Object.keys(patch).length > 0;
        const hasNewImage = !!selectedFile;

        if (!hasDogChanges && !hasNewImage) {
            onOpenChange(false);
            return;
        }

        setBusy(true);

        try {
            if (hasDogChanges) {
                await updateDog({ id: dog.id, diff: patch });
            }

            if (selectedFile) {
                await uploadDogPicture({ id: dog.id, file: selectedFile });
            }

            onOpenChange(false);

            if (hasDogChanges && hasNewImage) {
                toast.success(`Saved changes and uploaded a new picture for ${name.trim()}`);
            } else if (hasDogChanges) {
                toast.success(`Saved changes for ${name.trim()}`);
            } else {
                toast.success(`Uploaded a new picture for ${name.trim()}`);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to save changes. Please try again.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <BaseModal
            open={open}
            onOpenChange={onOpenChange}
            title="Edit dog"
            contentClassName="sm:max-w-md bg-card/95 backdrop-blur-sm"
            footer={
                <div className="flex w-full justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={handleClose} disabled={busy}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={busy}>
                        {busy ? "Saving…" : "Save changes"}
                    </Button>
                </div>
            }
        >
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label>Profile picture</Label>
                    <div className="flex items-center gap-4">
                        <div
                            className="h-20 w-20 overflow-hidden rounded-full border-4 bg-muted"
                            style={{ borderColor: safeBorderColor(color) }}
                        >
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt={`${dog.name} preview`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                    No image
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <Input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleFileChange}
                                disabled={busy}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or WebP</p>
                        </div>
                    </div>
                </div>

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
        </BaseModal>
    );
}