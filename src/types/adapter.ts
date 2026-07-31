/** Generic port implemented by every feed adapter. */
export type SourceAdapter<TEntry> = {
  id: string
  fetch: () => Promise<TEntry[]>
}
