import type { SourceAdapter } from '../types/adapter.ts'

/**
 * Run one or more source adapters and concatenate their entries.
 * Cross-source dedupe belongs in domain dedupe.ts (not here).
 */
export async function collectSources<TEntry>(
  sources: SourceAdapter<TEntry>[]
): Promise<{ entries: TEntry[]; sourceIds: string[] }> {
  const entries: TEntry[] = []
  const sourceIds: string[] = []

  for (const source of sources) {
    sourceIds.push(source.id)
    const batch = await source.fetch()
    entries.push(...batch)
  }

  return { entries, sourceIds }
}
