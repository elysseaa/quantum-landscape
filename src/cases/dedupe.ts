import type { CaseEntry } from '../types/cases.ts'

/**
 * Collapse duplicate case candidates across sources.
 * Prefer arxivId when present; otherwise slug within the same source.
 * First occurrence wins (registry order).
 */
export function dedupeCaseEntries(entries: CaseEntry[]): CaseEntry[] {
  const seen = new Set<string>()
  const out: CaseEntry[] = []

  for (const entry of entries) {
    const key = entry.arxivId
      ? `arxiv:${entry.arxivId}`
      : `name:${entry.slug}:${entry.source.id}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(entry)
  }

  return out
}
