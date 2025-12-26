
import type { DateRange } from "@/features/dateRangeFilter/model/DateRangeContext";
import { useDateRange } from "@/features/dateRangeFilter/model/useDateRange";
import { DateRangeControl } from "@/features/dateRangeFilter/ui/DateRangeControl";
import { Badge } from '@/shared/ui/badge';

function formatRangeLabel(range: DateRange) {
  return `${range.startDate} → ${range.endDate}`;
}

export function AnalyticsHeader({
  crumbs,
  scopeLabel,
}: {
  crumbs: Array<{ label: string; to?: string }>;
  scopeLabel?: string;
}) {
  const { range } = useDateRange();

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-2 text-lg text-muted-foreground">
            {crumbs.map((c, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <div key={`${c.label}-${i}`} className="flex items-center gap-2">
                  {i > 0 && <span className="opacity-60">/</span>}
                  {c.to && !isLast ? (
                    <a href={c.to} className="hover:text-foreground transition-colors">
                      {c.label}
                    </a>
                  ) : (
                    <span className={isLast ? 'text-foreground font-semibold' : ''}>
                      {c.label}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
          {scopeLabel ? (
            <Badge variant="secondary" className="h-6 px-2 text-xs">
              {scopeLabel}
            </Badge>
          ) : null}
        </div>

        {/* Optional subtext */}
        <div className="text-sm text-muted-foreground mt-1">
          {formatRangeLabel(range)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DateRangeControl />
      </div>
    </div>
  );
}
