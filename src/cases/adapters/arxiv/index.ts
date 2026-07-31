import type { SourceAdapter } from '../../../types/adapter.ts'
import type { CaseEntry } from '../../../types/cases.ts'
import { fetchArxivAtom, type ArxivFetchOptions } from './fetch.ts'
import { parseArxivAtom } from './parse.ts'

export type ArxivAdapterOptions = ArxivFetchOptions & {
  /** Inject Atom XML instead of fetching (unit tests). */
  xml?: string
}

export async function fetchArxivEntries(
  options: ArxivAdapterOptions = {}
): Promise<CaseEntry[]> {
  const xml = options.xml ?? (await fetchArxivAtom(options))
  return parseArxivAtom(xml)
}

export const arxivAdapter: SourceAdapter<CaseEntry> = {
  id: 'arxiv',
  fetch: () => fetchArxivEntries(),
}
