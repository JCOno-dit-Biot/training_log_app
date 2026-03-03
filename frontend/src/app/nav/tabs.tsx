import { Bike, ChartNoAxesCombined, PawPrint, Settings, Weight } from "lucide-react";

export const NAV_TABS = [
    { path: "/kennel", label: "My Kennel", Icon: PawPrint },
    { path: "/activities", label: "Activities", Icon: Bike },
    { path: "/weight", label: "Weight", Icon: Weight },
    { path: "/analytics", label: "Analytics", Icon: ChartNoAxesCombined },
    { path: "/settings", label: "Settings", Icon: Settings },
] as const;