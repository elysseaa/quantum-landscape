/**
 * arXiv API fetch (legacy Atom query interface).
 *
 * Compliance notes (https://info.arxiv.org/help/api/tou.html):
 * - Descriptive metadata only (title, abstract, ids, links) — CC0; we do not
 *   download or re-host PDFs/source.
 * - Rate limit: at most one request every three seconds, one connection at a time.
 *   This module issues a single GET per call by default. If you add paging,
 *   wait ≥3s between requests (see delayBetweenArxivRequests).
 * - Identify the client via User-Agent.
 */

export const ARXIV_API_URL = 'https://export.arxiv.org/api/query'

/** Default: Quantum Physics category, newest first, one page. */
export const ARXIV_DEFAULT_SEARCH = 'cat:quant-ph'
export const ARXIV_DEFAULT_MAX_RESULTS = 50

export type ArxivFetchOptions = {
  /** Override full query URL (tests). */
  url?: string
  searchQuery?: string
  maxResults?: number
  /** arXiv `start` paging offset (default 0). */
  start?: number
}

const USER_AGENT =
  'quantum-landscape/0.1 (+https://github.com/elysseaa/quantum-landscape; OpenQase survey tool)'

/** Minimum pause between successive arXiv API calls (ToU). */
export const ARXIV_MIN_REQUEST_INTERVAL_MS = 3000

let lastRequestAt = 0

/**
 * Wait until at least ARXIV_MIN_REQUEST_INTERVAL_MS since the last request.
 * Call before every HTTP request if you page through results.
 */
export async function delayBetweenArxivRequests(): Promise<void> {
  const elapsed = Date.now() - lastRequestAt
  const wait = ARXIV_MIN_REQUEST_INTERVAL_MS - elapsed
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait))
  }
}

function buildQueryUrl(options: ArxivFetchOptions): string {
  if (options.url) return options.url

  const params = new URLSearchParams({
    search_query: options.searchQuery ?? ARXIV_DEFAULT_SEARCH,
    start: String(options.start ?? 0),
    max_results: String(options.maxResults ?? ARXIV_DEFAULT_MAX_RESULTS),
    sortBy: 'submittedDate',
    sortOrder: 'descending',
  })
  return `${ARXIV_API_URL}?${params.toString()}`
}

/** HTTP GET of one arXiv Atom query page (metadata only). */
export async function fetchArxivAtom(
  options: ArxivFetchOptions = {}
): Promise<string> {
  await delayBetweenArxivRequests()

  const url = buildQueryUrl(options)
  const res = await fetch(url, {
    headers: {
      Accept: 'application/atom+xml, application/xml, text/xml, */*',
      'User-Agent': USER_AGENT,
    },
  })

  lastRequestAt = Date.now()

  if (!res.ok) {
    throw new Error(
      `arXiv API fetch failed: ${res.status} ${res.statusText} (${url})`
    )
  }

  return res.text()
}
