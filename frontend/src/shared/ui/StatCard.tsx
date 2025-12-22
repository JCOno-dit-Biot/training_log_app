import * as React from 'react';

import { cn } from '@/shared/lib/utils';

import { Spinner } from './Spinner';

export function StatCard({
    title,
    value,
    subtitle,
    right,
    loading,
    compact
}: {
    title: string;
    value: React.ReactNode;
    subtitle?: React.ReactNode;
    right?: React.ReactNode; // e.g. delta pill
    loading?: boolean;
    compact?: boolean;
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
        <div
            className={cn(
                'rounded-md border',
                compact ? 'p-3' : 'p-4'
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>
                        {title}
                    </div>

                    <div
                        className={cn(
                            'font-semibold leading-none',
                            compact ? 'mt-1 text-xl' : 'mt-2 text-2xl'
                        )}
                    >
                        {displayValue}
                    </div>

                    {subtitle ? (
                        <div className={cn('text-muted-foreground', compact ? 'mt-1 text-xs' : 'mt-2 text-sm')}>
                            {subtitle}
                        </div>
                    ) : null}
                </div>

                {right ? <div className="shrink-0">{right}</div> : null}
            </div>
        </div>
    );
}