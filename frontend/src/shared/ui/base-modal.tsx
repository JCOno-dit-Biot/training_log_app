import * as React from "react"

import { cn } from "@/shared/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/dialog"

type BaseModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: React.ReactNode
    description?: React.ReactNode
    children: React.ReactNode
    footer?: React.ReactNode
    className?: string
    contentClassName?: string
}

export function BaseModal({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    className,
    contentClassName,
}: BaseModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "sm:max-w-[560px] rounded-2xl",
                    contentClassName
                )}
            >
                <DialogHeader className={cn("space-y-2", className)}>
                    <DialogTitle>{title}</DialogTitle>
                    {description ? <DialogDescription>{description}</DialogDescription> : null}
                </DialogHeader>

                <div className="py-2">{children}</div>

                {footer ? <DialogFooter>{footer}</DialogFooter> : null}
            </DialogContent>
        </Dialog>
    )
}