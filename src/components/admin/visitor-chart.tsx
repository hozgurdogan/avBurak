import type { DailyVisitorCount } from '@/lib/admin/analytics';

/**
 * Plain inline SVG bars, no charting library - the whole dashboard needs one
 * chart, and a dependency for that is not a trade worth making. Server
 * component: the data is static per request, nothing here needs a browser.
 */
export function VisitorChart({ data, emptyLabel }: { data: DailyVisitorCount[]; emptyLabel: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const hasAny = data.some((d) => d.count > 0);

  const width = 640;
  const height = 160;
  const barGap = 2;
  const barWidth = data.length > 0 ? width / data.length - barGap : 0;

  if (!hasAny) {
    return <p className="text-sm text-ink-faint">{emptyLabel}</p>;
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="none"
      className="h-40 w-full"
    >
      {data.map((day, index) => {
        const barHeight = (day.count / max) * (height - 4);
        const x = index * (barWidth + barGap);
        const y = height - barHeight;
        return (
          <rect
            key={day.date}
            x={x}
            y={y}
            width={Math.max(barWidth, 1)}
            height={Math.max(barHeight, 1)}
            fill="var(--color-gold-800)"
          >
            <title>
              {day.date}: {day.count}
            </title>
          </rect>
        );
      })}
    </svg>
  );
}
