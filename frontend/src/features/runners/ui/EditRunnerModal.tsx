import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { diff } from "@shared/util/diffObject";
import type { Runner } from "@entities/runners/model";
import { BaseModal } from "@/shared/ui/base-modal";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { useUpdateRunner, useUploadRunnerPicture } from "../model/useRunners";

interface EditRunnerModalProps {
    runner: Runner;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EditRunnerModal({ runner, open, onOpenChange }: EditRunnerModalProps) {
    const { mutateAsync: updateRunner } = useUpdateRunner({ revalidate: true });
    const { mutateAsync: uploadRunnerPicture } = useUploadRunnerPicture();

    const [busy, setBusy] = useState(false);

    const [name, setName] = useState(runner.name ?? "");

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(runner.image_url ?? null);

    useEffect(() => {
        if (!open) return;

        setName(runner.name ?? "");
        setSelectedFile(null);
        setPreviewUrl(runner.image_url ?? null);
    }, [runner, open]);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const formSnapshot = useMemo<Partial<Runner>>(
        () => ({
            id: runner.id,
            name: name.trim()
        }),
        [runner.id, name],
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
                id: runner.id,
                name: runner.name ?? ""
            },
            formSnapshot,
        );

        const hasRunnerChanges = Object.keys(patch).length > 0;
        const hasNewImage = !!selectedFile;

        if (!hasRunnerChanges && !hasNewImage) {
            onOpenChange(false);
            return;
        }

        setBusy(true);

        try {
            if (hasRunnerChanges) {
                await updateRunner({ id: runner.id, diff: patch });
            }

            if (selectedFile) {
                await uploadRunnerPicture({ id: runner.id, file: selectedFile });
            }

            onOpenChange(false);

            if (hasRunnerChanges && hasNewImage) {
                toast.success(`Saved changes and uploaded a new picture for ${name.trim()}`);
            } else if (hasRunnerChanges) {
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
            title="Edit runner"
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
                            className="h-20 w-20 overflow-hidden rounded-full border bg-muted"
                        >
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt={`${runner.name} preview`}
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
                    <Label htmlFor="runner-name">Name</Label>
                    <Input
                        id="runner-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Bolt"
                        disabled={busy}
                    />
                </div>
            </div>
        </BaseModal>
    );
}