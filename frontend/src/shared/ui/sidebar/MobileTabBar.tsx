import { NAV_TABS } from "@/app/nav/tabs";

import MobileTabItem from "./MobileTabItem";

export default function MobileTabBar() {
    return (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-primary text-primary-foreground md:hidden">
            {/* Safe area padding for iOS */}
            <div className="pb-[env(safe-area-inset-bottom)]">
                <div className="grid h-16 grid-cols-5">
                    {NAV_TABS.map(({ path, label, Icon }) => (
                        <MobileTabItem
                            key={path}
                            to={path}
                            label={label}
                            icon={<Icon />}
                        />
                    ))}
                </div>
            </div>
        </nav>
    );
}