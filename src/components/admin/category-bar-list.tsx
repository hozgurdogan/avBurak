/** Plain horizontal bars for a short, labelled breakdown (e.g. views by
 *  language) - simpler markup than the SVG chart suits three or four rows
 *  better than a bar chart would. Server component, no interactivity. */
export function CategoryBarList({
  items,
  emptyLabel,
}: {
  items: Array<{ label: string; count: number }>;
  emptyLabel: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.count));
  const hasAny = items.some((item) => item.count > 0);

  if (!hasAny) {
    return <p className="text-sm text-ink-faint">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-4">
          <span className="w-24 shrink-0 text-sm text-ink-muted">{item.label}</span>
          <div className="h-3 flex-1 bg-canvas-deep">
            <div
              className="h-full bg-gold-800"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-end text-sm tabular-nums text-ink" dir="ltr">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}
