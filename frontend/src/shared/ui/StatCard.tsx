import * as React from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

import type { MetricTrend } from '@/features/analytics/utils/computeMetricTrend';
import { cn } from '@/shared/lib/utils';

import { Spinner } from './Spinner';

function formatPct(p: number) {
    const sign = p > 0 ? '+' : '';
    return `${sign}${Math.round(p * 100)}%`;
}

function formatSigned(n: number, digits = 0) {
    const sign = n > 0 ? '+' : '';
    return `${sign}${n.toFixed(digits)}`;
}

export function InlineTrend({
    trend,
    label,          // "vs last year" / "vs prev period"
    loading,
    className,
}: {
    trend?: MetricTrend;
    label?: string;
    loading?: boolean;
    className?: string;
}) {
    if (loading) return null;
    if (!trend || trend.direction === 'none' || trend.pct == null) return null;

    const isUp = trend.pct > 0;
    const isDown = trend.pct < 0;

    const Icon =
        trend.direction === 'up' ? ArrowUp :
            trend.direction === 'down' ? ArrowDown :
                Minus;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 text-sm font-medium',
                isUp && 'text-green-600',
                isDown && 'text-red-600',
                !isUp && !isDown && 'text-muted-foreground',
                className
            )}
            title={label ? `${formatPct(trend.pct)} ${label}` : formatPct(trend.pct)}
        >
            <Icon className="h-4 w-4" />
            {formatPct(trend.pct)}
        </span>
    );
}

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
                'rounded-md border border-neutral-500',
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