import * as React from 'react';

import { Card } from '@/shared/ui/card';

import { Spinner } from './Spinner';
export function StatCard({
    title,
    value,
    subtitle,
    right,
    loading
}: {
    title: string;
    value: React.ReactNode;
    subtitle?: React.ReactNode;
    right?: React.ReactNode; // e.g. delta pill
    loading?: boolean;
}) {
    const displayValue = React.useMemo(() => {
        if (loading) {
            return (
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Spinner size={16} />
                </span>
            );
        }
        return value
    }, [loading, value]);
    return (
        <Card className="p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-md text-accent-foreground">{title}</div>
                    <div className="mt-2 text-xl font-semibold leading-none">{displayValue}</div>
                    {subtitle ? (
                        <div className="mt-2 text-xs text-muted-foreground">{subtitle}</div>
                    ) : null}
                </div>
                {right ? <div className="shrink-0">{right}</div> : null}
            </div>
        </Card>
    );
}
