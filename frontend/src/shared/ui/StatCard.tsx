import * as React from 'react';

import { Card } from '@/shared/ui/card';

export function StatCard({
    title,
    value,
    subtitle,
    right,
}: {
    title: string;
    value: React.ReactNode;
    subtitle?: React.ReactNode;
    right?: React.ReactNode; // e.g. delta pill
}) {
    return (
        <Card className="p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{title}</div>
                    <div className="mt-1 text-2xl font-semibold leading-none">{value}</div>
                    {subtitle ? (
                        <div className="mt-2 text-xs text-muted-foreground">{subtitle}</div>
                    ) : null}
                </div>
                {right ? <div className="shrink-0">{right}</div> : null}
            </div>
        </Card>
    );
}
