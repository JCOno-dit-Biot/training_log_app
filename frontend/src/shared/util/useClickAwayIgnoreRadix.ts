import * as React from "react";

export function useClickAwayIgnoringRadix<T extends HTMLElement>(
    ref: React.RefObject<T>,
    onAway: () => void,
    enabled: boolean = true
) {
    React.useEffect(() => {
        if (!enabled) return;

        function onPointerDown(e: PointerEvent) {
            const target = e.target as HTMLElement | null;
            if (!target) return;

            // 1) click inside the panel => ignore
            if (ref.current?.contains(target)) return;

            // 2) click inside any Radix popover content (Calendar, Combobox, etc.) => ignore
            // PopoverContent is wrapped in a portal element with this attribute
            if (target.closest("[data-radix-popper-content-wrapper]")) return;

            // Otherwise it's a real click-away
            onAway();
        }

        // capture=true makes it more reliable if components stop propagation
        document.addEventListener("pointerdown", onPointerDown, true);
        return () => document.removeEventListener("pointerdown", onPointerDown, true);
    }, [ref, onAway, enabled]);
}
