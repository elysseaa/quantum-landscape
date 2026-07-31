import { defaultOpenqaseDataPath } from '../openqase/fetch-catalog.ts'
import { readOpenqaseCatalog } from '../openqase/read-catalog.ts'
import type { OpenqaseCatalog } from '../types/openqase.ts'
import type { SoftwareEntry } from '../types/software.ts'
import { parseGithubRepo, slugify } from '../utils/normalize.ts'

/** Map OpenQase catalog software rows into SoftwareEntry. */
export function mapOpenqaseSoftware(
  catalog: OpenqaseCatalog
): SoftwareEntry[] {
  return (catalog.quantum_software ?? []).map((row) => {
    const primary =
      row.github_url || row.website_url || row.documentation_url || ''
    const githubRepo = row.github_url
      ? parseGithubRepo(row.github_url)
      : undefined
    return {
      name: row.name,
      slug: row.slug || slugify(row.name),
      description: row.description ?? undefined,
      urls: {
        primary: primary || `openqase:${row.slug}`,
        github: row.github_url ?? undefined,
      },
      githubRepo,
      source: { id: 'openqase', ref: row.id },
    } satisfies SoftwareEntry
  })
}

/**
 * Load the OpenQase software baseline from data/openqase.json.
 * Not an external SourceAdapter — used only for gap comparison.
 */
export async function loadSoftwareBaseline(
  dataPath: string = defaultOpenqaseDataPath
): Promise<SoftwareEntry[]> {
  return mapOpenqaseSoftware(await readOpenqaseCatalog(dataPath))
}
