export type SoftwareSourceId = 'qosf' | 'openqase' | 'polystacks'

export type SoftwareEntry = {
  name: string
  /** Lowercase hyphenated name for fuzzy matching. */
  slug: string
  description?: string
  category?: string
  language?: string
  urls: {
    primary: string
    github?: string
  }
  /** `owner/repo` lowercase when a GitHub URL is known. */
  githubRepo?: string
  /** True when the source marks the project abandoned / archived. */
  abandoned?: boolean
  source: {
    id: SoftwareSourceId
    /** Optional breadcrumb for debugging (e.g. README line). */
    ref?: string
  }
}

export type SoftwareDiff = {
  matched_by: 'github' | 'slug' | 'alias'
  external: SoftwareEntry
  openqase: SoftwareEntry
}

export type SoftwareGapReport = {
  generated_at: string
  sources: string[]
  counts: {
    external: number
    openqase: number
    missing_in_openqase: number
    in_both: number
    openqase_only: number
  }
  missing_in_openqase: SoftwareEntry[]
  in_both: SoftwareDiff[]
  openqase_only: SoftwareEntry[]
}
