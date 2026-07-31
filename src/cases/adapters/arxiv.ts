import type { SourceAdapter } from '../../types/adapter.ts'
import type { CaseEntry } from '../../types/cases.ts'

/**
 * Stub for an arXiv API adapter (case-study candidates).
 * Returns an empty list until implemented.
 */
export async function fetchArxivEntries(): Promise<CaseEntry[]> {
  return []
}

export const arxivAdapter: SourceAdapter<CaseEntry> = {
  id: 'arxiv',
  fetch: fetchArxivEntries,
}
