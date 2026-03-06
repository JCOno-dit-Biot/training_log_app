import { Link, useLocation } from "react-router-dom";

import { Button } from "../button";

type MobileTabItemProps = {
    to: string;
    label: string;
    icon: React.ReactNode;
    matchPrefix?: boolean; // isActive = True if visiting /analytics/...
};

export default function MobileTabItem({
    to,
    label,
    icon,
    matchPrefix = true,
}: MobileTabItemProps) {
    const location = useLocation();

    const isActive = matchPrefix
        ? location.pathname === to || location.pathname.startsWith(to + "/")
        : location.pathname === to;

    return (
        <Button
            asChild
            variant={isActive ? "secondary" : "ghost"}
            className="h-16 w-full rounded-none px-0"
        >
            <Link
                to={to}
                aria-label={label}
                className="flex h-full w-full items-center justify-center"
            >
                <span className="h-6 w-6">{icon}</span>
            </Link>
        </Button>
    );
}