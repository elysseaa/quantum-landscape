import { resolveAlias } from '../utils/aliases.ts'
import { parseGithubRepo, slugify } from '../utils/normalize.ts'
import type {
  SoftwareDiff,
  SoftwareEntry,
  SoftwareGapReport,
} from '../types/software.ts'
import { SOFTWARE_SLUG_ALIASES } from './aliases.ts'

type Keys = {
  github?: string
  slug: string
  canonical: string
}

function matchKeys(entry: SoftwareEntry): Keys {
  const github =
    entry.githubRepo ??
    (entry.urls.github ? parseGithubRepo(entry.urls.github) : undefined) ??
    parseGithubRepo(entry.urls.primary)
  const slug = entry.slug || slugify(entry.name)
  return {
    github,
    slug,
    canonical: resolveAlias(SOFTWARE_SLUG_ALIASES, slug),
  }
}

/**
 * Diff an external catalog against the OpenQase software baseline.
 * Match order: GitHub owner/repo → alias-aware slug.
 */
export function diffAgainstOpenqase(
  external: SoftwareEntry[],
  baseline: SoftwareEntry[],
  sources: string[]
): SoftwareGapReport {
  const byGithub = new Map<string, SoftwareEntry>()
  const bySlug = new Map<string, SoftwareEntry>()

  for (const row of baseline) {
    const keys = matchKeys(row)
    if (keys.github) byGithub.set(keys.github, row)
    bySlug.set(keys.canonical, row)
    bySlug.set(keys.slug, row)
  }

  const missing: SoftwareEntry[] = []
  const both: SoftwareDiff[] = []
  const matchedBaseline = new Set<SoftwareEntry>()

  for (const ext of external) {
    if (ext.abandoned) continue
    const keys = matchKeys(ext)
    let hit: SoftwareEntry | undefined
    let matched_by: SoftwareDiff['matched_by'] | undefined

    if (keys.github) {
      hit = byGithub.get(keys.github)
      if (hit) matched_by = 'github'
    }

    if (!hit) {
      hit = bySlug.get(keys.canonical) ?? bySlug.get(keys.slug)
      if (hit) {
        matched_by = keys.canonical !== keys.slug ? 'alias' : 'slug'
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
      external: external.filter((e) => !e.abandoned).length,
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
