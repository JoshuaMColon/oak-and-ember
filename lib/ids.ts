/** Stable UUID-shaped ids so the TypeScript catalog and SQL seed stay aligned. */
export function uid(group: number, n: number) {
  const g = group.toString(16).padStart(8, "0");
  const i = n.toString(16).padStart(12, "0");
  return `${g}-0000-4000-8000-${i}`;
}
