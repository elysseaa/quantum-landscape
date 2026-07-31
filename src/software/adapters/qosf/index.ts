import type { SourceAdapter } from '../../../types/adapter.ts'
import type { SoftwareEntry } from '../../../types/software.ts'
import { fetchQosfReadme, type QosfFetchOptions } from './fetch.ts'
import { parseQosfReadme } from './parse.ts'

export type QosfAdapterOptions = QosfFetchOptions & {
  /** Inject markdown instead of fetching (unit tests). */
  markdown?: string
  includeAbandoned?: boolean
}

export async function fetchQosfEntries(
  options: QosfAdapterOptions = {}
): Promise<SoftwareEntry[]> {
  const markdown =
    options.markdown ?? (await fetchQosfReadme({ url: options.url }))
  return parseQosfReadme(markdown, {
    includeAbandoned: options.includeAbandoned,
  })
}

export const qosfAdapter: SourceAdapter<SoftwareEntry> = {
  id: 'qosf',
  fetch: () => fetchQosfEntries(),
}
