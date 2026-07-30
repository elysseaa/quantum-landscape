export type OpenqaseSoftwareRow = {
  id: string
  name: string
  slug: string
  description: string | null
  vendor: string | null
  github_url: string | null
  website_url: string | null
  documentation_url: string | null
  license_type: string | null
}

export type OpenqaseCaseStudyRow = {
  id: string
  title: string
  slug: string
  description: string | null
  year: number | null
}

/** On-disk artifact written by `npm run fetch:openqase`. */
export type OpenqaseCatalog = {
  fetched_at: string
  source: {
    supabase_url: string
    note: string
  }
  counts: {
    quantum_software: number
    case_studies: number
  }
  quantum_software: OpenqaseSoftwareRow[]
  case_studies: OpenqaseCaseStudyRow[]
}
