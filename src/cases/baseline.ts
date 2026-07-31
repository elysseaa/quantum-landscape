import { defaultOpenqaseDataPath } from '../openqase/fetch-catalog.ts'
import { readOpenqaseCatalog } from '../openqase/read-catalog.ts'
import type { OpenqaseCatalog } from '../types/openqase.ts'
import type { CaseEntry } from '../types/cases.ts'
import { slugify } from '../utils/normalize.ts'

/** Map OpenQase catalog case_studies into CaseEntry. */
export function mapOpenqaseCases(catalog: OpenqaseCatalog): CaseEntry[] {
  return (catalog.case_studies ?? []).map((row) => {
    const slug = row.slug || slugify(row.title)
    return {
      title: row.title,
      slug,
      description: row.description ?? undefined,
      year: row.year,
      urls: {
        primary: `openqase:${slug}`,
      },
      source: { id: 'openqase', ref: row.id },
    } satisfies CaseEntry
  })
}

/**
 * Load the OpenQase cases baseline from data/openqase.json.
 * Not an external SourceAdapter — used only for gap comparison.
 */
export async function loadCasesBaseline(
  dataPath: string = defaultOpenqaseDataPath
): Promise<CaseEntry[]> {
  return mapOpenqaseCases(await readOpenqaseCatalog(dataPath))
}
