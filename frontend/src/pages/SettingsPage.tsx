// src/pages/SettingsPage.tsx  (or wherever your routing lives)
import { LocationsSettingsTab } from "@/features/settings/locations/ui/LocationsSettingsTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"

export function SettingsPage() {
    const activeSecondary =
        "data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-none"

    return (
        <div className="mx-auto w-full space-y-6 p-6 bg-neutral-25">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold">Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Manage kennel configuration and reference data.
                </p>
            </div>

            <Tabs defaultValue="locations" className="w-full">
                <TabsList>
                    <TabsTrigger className={`${activeSecondary}`} value="locations">Locations</TabsTrigger>
                    <TabsTrigger className={`${activeSecondary}`} value="account">Account</TabsTrigger>
                </TabsList>

                <TabsContent value="locations" className="pt-4">
                    <LocationsSettingsTab />
                </TabsContent>

                <TabsContent value="dogs" className="pt-4">
                    <div className="text-sm text-muted-foreground">TODO</div>
                </TabsContent>

                <TabsContent value="account" className="pt-4">
                    <div className="text-sm text-muted-foreground">TODO</div>
                </TabsContent>
            </Tabs>
        </div>
    )
}