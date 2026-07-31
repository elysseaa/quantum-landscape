import { createClient } from '@supabase/supabase-js'
import path from 'node:path'
import { loadEnvFiles, packageRoot, requireEnv } from '../utils/env.ts'
import type {
  OpenqaseCaseStudyRow,
  OpenqaseCatalog,
  OpenqaseSoftwareRow,
} from '../types/openqase.ts'

export const defaultOpenqaseDataPath = path.join(
  packageRoot,
  'data',
  'openqase.json'
)

async function fetchAllPages<T>(
  fetchPage: (
    from: number,
    to: number
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const pageSize = 1000
  const rows: T[] = []
  let from = 0

  for (;;) {
    const to = from + pageSize - 1
    const { data, error } = await fetchPage(from, to)
    if (error) throw new Error(error.message)
    const batch = data ?? []
    rows.push(...batch)
    if (batch.length < pageSize) break
    from += pageSize
  }

  return rows
}

/**
 * Pull published OpenQase software + case studies via the anon key (RLS).
 * Pure I/O — callers write the result to disk.
 */
export async function fetchOpenqaseCatalog(): Promise<OpenqaseCatalog> {
  await loadEnvFiles()

  const url = requireEnv('OPENQASE_SUPABASE_URL')
  const anonKey = requireEnv('OPENQASE_SUPABASE_ANON_KEY')

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const software = await fetchAllPages<OpenqaseSoftwareRow>((from, to) =>
    supabase
      .from('quantum_software')
      .select(
        'id, name, slug, description, vendor, github_url, website_url, documentation_url, license_type'
      )
      .eq('published', true)
      .is('deleted_at', null)
      .order('slug')
      .range(from, to)
  )

  const caseStudies = await fetchAllPages<OpenqaseCaseStudyRow>((from, to) =>
    supabase
      .from('case_studies')
      .select('id, title, slug, description, year')
      .eq('published', true)
      .is('deleted_at', null)
      .order('slug')
      .range(from, to)
  )

  return {
    fetched_at: new Date().toISOString(),
    source: {
      supabase_url: url,
      note: 'Published rows only, via anon key (RLS).',
    },
    counts: {
      quantum_software: software.length,
      case_studies: caseStudies.length,
    },
    quantum_software: software,
    case_studies: caseStudies,
  }
}
