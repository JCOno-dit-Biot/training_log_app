import * as React from "react";

type MaybeRef<T extends HTMLElement = HTMLElement> = React.RefObject<T | null>;

export function useClickAwayIgnoringRadix(
    refs: MaybeRef[],
    onAway: () => void,
    enabled: boolean = true
) {
    React.useEffect(() => {
        if (!enabled) return;

        function isInsideIgnoredRef(target: Node | null) {
            if (!target) return false;
            return refs.some((ref) => ref.current?.contains(target) ?? false);
        }

        function isInsideRadixLayer(target: HTMLElement | null) {
            if (!target) return false;

            return Boolean(
                target.closest("[data-radix-popper-content-wrapper]") ||
                target.closest("[data-radix-portal]") ||
                target.closest("[role='dialog']") ||
                target.closest("[role='listbox']") ||
                target.closest("[data-slot='popover-content']") ||
                target.closest("[data-slot='dropdown-menu-content']") ||
                target.closest("[data-slot='select-content']") ||
                target.closest("[cmdk-root]")
            );
        }

        function onPointerDown(e: PointerEvent) {
            const target = e.target as HTMLElement | null;
            if (!target) return;

            // 1) click inside tracked refs
            if (isInsideIgnoredRef(target)) return;

            // 2) click inside Radix/shadcn portaled content
            if (isInsideRadixLayer(target)) return;

            // 3) extra safety with composed path for portals/shadow DOM
            const path = e.composedPath?.() ?? [];
            const clickedTrackedRef = refs.some((ref) => ref.current && path.includes(ref.current));
            if (clickedTrackedRef) return;

            onAway();
        }

        document.addEventListener("pointerdown", onPointerDown, true);
        return () => document.removeEventListener("pointerdown", onPointerDown, true);
    }, [refs, onAway, enabled]);
}