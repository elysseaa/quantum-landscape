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
