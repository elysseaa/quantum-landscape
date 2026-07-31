import { resolveAlias } from '../utils/aliases.ts'
import type { CaseDiff, CaseEntry, CaseGapReport } from '../types/cases.ts'
import { CASE_ALIASES } from './aliases.ts'

/**
 * Diff external case candidates against the OpenQase cases baseline.
 * Match order: arXiv id → alias-aware slug.
 */
export function diffCasesAgainstOpenqase(
  external: CaseEntry[],
  baseline: CaseEntry[],
  sources: string[]
): CaseGapReport {
  const byArxiv = new Map<string, CaseEntry>()
  const bySlug = new Map<string, CaseEntry>()

  for (const row of baseline) {
    if (row.arxivId) byArxiv.set(row.arxivId, row)
    const slug = resolveAlias(CASE_ALIASES, row.slug)
    bySlug.set(slug, row)
    bySlug.set(row.slug, row)
  }

  const missing: CaseEntry[] = []
  const both: CaseDiff[] = []
  const matchedBaseline = new Set<CaseEntry>()

  for (const ext of external) {
    let hit: CaseEntry | undefined
    let matched_by: CaseDiff['matched_by'] | undefined

    if (ext.arxivId && byArxiv.has(ext.arxivId)) {
      hit = byArxiv.get(ext.arxivId)
      matched_by = 'arxiv'
    }

    if (!hit) {
      const canonical = resolveAlias(CASE_ALIASES, ext.slug)
      hit = bySlug.get(canonical) ?? bySlug.get(ext.slug)
      if (hit) {
        matched_by = canonical !== ext.slug ? 'alias' : 'slug'
      }
    }

    if (hit && matched_by) {
      both.push({ matched_by, external: ext, openqase: hit })
      matchedBaseline.add(hit)
    } else {
      missing.push(ext)
    }
  }

  const openqaseOnly = baseline.filter((row) => !matchedBaseline.has(row))

  return {
    generated_at: new Date().toISOString(),
    sources,
    counts: {
      external: external.length,
      openqase: baseline.length,
      missing_in_openqase: missing.length,
      in_both: both.length,
      openqase_only: openqaseOnly.length,
    },
    missing_in_openqase: missing,
    in_both: both,
    openqase_only: openqaseOnly,
  }
}
