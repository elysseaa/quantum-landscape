import type { CaseEntry } from '../types/cases.ts'

/**
 * Diff external case candidates against the OpenQase cases baseline.
 * Matching is passthrough until arXiv / slug logic lands.
 */
export function diffCasesAgainstOpenqase(
  external: CaseEntry[],
  baseline: CaseEntry[],
  sources: string[]
) {
  return {
    generated_at: new Date().toISOString(),
    sources,
    counts: {
      external: external.length,
      openqase: baseline.length,
      missing_in_openqase: external.length,
      in_both: 0,
      openqase_only: baseline.length,
    },
    missing_in_openqase: external,
    in_both: [] as Array<{
      matched_by: 'arxiv' | 'slug' | 'alias'
      external: CaseEntry
      openqase: CaseEntry
    }>,
    openqase_only: baseline,
  }
}
