import { formatPrice } from "@/lib/money";

export function SalesChart({
  points,
}: {
  points: { key: string; label: string; cents: number }[];
}) {
  const max = Math.max(...points.map((point) => point.cents), 1);
  if (points.length === 0) {
    return <p className="text-sm text-muted">No paid orders in this range yet.</p>;
  }

  return (
    <figure>
      <figcaption className="sr-only">Monthly sales</figcaption>
      <div className="flex h-44 items-end gap-2" aria-hidden="true">
        {points.map((point) => (
          <div key={point.key} className="flex h-full flex-1 items-end" title={`${point.label}: ${formatPrice(point.cents)}`}>
            <div
              className="w-full rounded-t-lg bg-ember-deep transition hover:bg-ember dark:bg-ember"
              style={{ height: `${Math.max(6, (point.cents / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2" aria-hidden="true">
        {points.map((point) => (
          <p key={point.key} className="flex-1 text-center text-xs text-muted">{point.label}</p>
        ))}
      </div>
      <table className="sr-only">
        <caption>Sales by month</caption>
        <tbody>
          {points.map((point) => (
            <tr key={point.key}>
              <th scope="row">{point.label}</th>
              <td>{formatPrice(point.cents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
