/**
 * Read-only snapshot of published OpenQase catalog rows.
 *
 * Uses the anon (public) Supabase key — no service role, no writes.
 * RLS on OpenQase only returns published, non-deleted content to anon.
 *
 * Usage:
 *   cp .env.example .env.local   # set OPENQASE_SUPABASE_URL + OPENQASE_SUPABASE_ANON_KEY
 *   npm install
 *   npm run snapshot
 */

import { createClient } from '@supabase/supabase-js'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outPath = path.join(root, 'data', 'openqase-snapshot.json')

type SoftwareRow = {
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

type CaseStudyRow = {
  id: string
  title: string
  slug: string
  description: string | null
  year: number | null
}

async function loadEnvFiles() {
  const existing = new Set(Object.keys(process.env))
  const files: Array<{ name: string; override: boolean }> = [
    { name: '.env', override: false },
    { name: '.env.local', override: true },
  ]

  for (const { name, override } of files) {
    try {
      const text = await readFile(path.join(root, name), 'utf8')
      for (const line of text.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq <= 0) continue
        const key = trimmed.slice(0, eq).trim()
        let value = trimmed.slice(eq + 1).trim()
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1)
        }
        if (existing.has(key)) continue
        if (!override && key in process.env) continue
        process.env[key] = value
      }
    } catch {
      // try next file
    }
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and set the OpenQase anon credentials.`
    )
  }
  return value
}

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

async function main() {
  await loadEnvFiles()

  const url = requireEnv('OPENQASE_SUPABASE_URL')
  const anonKey = requireEnv('OPENQASE_SUPABASE_ANON_KEY')

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const software = await fetchAllPages<SoftwareRow>((from, to) =>
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

  const caseStudies = await fetchAllPages<CaseStudyRow>((from, to) =>
    supabase
      .from('case_studies')
      .select('id, title, slug, description, year')
      .eq('published', true)
      .is('deleted_at', null)
      .order('slug')
      .range(from, to)
  )

  const snapshot = {
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

  await mkdir(path.dirname(outPath), { recursive: true })
  await writeFile(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')

  console.log(`Wrote ${outPath}`)
  console.log(`  quantum_software: ${software.length}`)
  console.log(`  case_studies:     ${caseStudies.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
