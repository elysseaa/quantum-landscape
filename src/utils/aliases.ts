/**
 * Look up a canonical key in an alias map.
 * Returns the mapped value when present, otherwise the original key.
 */
export function resolveAlias(
  map: Record<string, string>,
  key: string
): string {
  return map[key] ?? key
}
