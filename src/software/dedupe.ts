import type { SoftwareEntry } from '../types/software.ts'

/**
 * Collapse duplicate projects across sources.
 * Prefer githubRepo when present; otherwise name+slug within the same source.
 * First occurrence wins (registry order).
 */
export function dedupeSoftwareEntries(
  entries: SoftwareEntry[]
): SoftwareEntry[] {
  const seen = new Set<string>()
  const out: SoftwareEntry[] = []

  for (const entry of entries) {
    const key = entry.githubRepo
      ? `gh:${entry.githubRepo}`
      : `name:${entry.slug}:${entry.source.id}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(entry)
  }

  return out
}
