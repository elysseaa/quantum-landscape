export type CaseSourceId = 'openqase' | 'arxiv' | 'rss'

/** Normalized case-study / paper candidate (external or OpenQase). */
export type CaseEntry = {
  title: string
  slug: string
  description?: string
  year?: number | null
  urls: {
    primary: string
    arxiv?: string
  }
  /** arXiv id when known, e.g. 1912.06070 */
  arxivId?: string
  source: {
    id: CaseSourceId
    ref?: string
  }
}

export type CaseDiff = {
  matched_by: 'arxiv' | 'slug' | 'alias'
  external: CaseEntry
  openqase: CaseEntry
}

export type CaseGapReport = {
  generated_at: string
  sources: string[]
  counts: {
    external: number
    openqase: number
    missing_in_openqase: number
    in_both: number
    openqase_only: number
  }
  missing_in_openqase: CaseEntry[]
  in_both: CaseDiff[]
  openqase_only: CaseEntry[]
}
