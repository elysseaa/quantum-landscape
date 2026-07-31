/** Default remote README used by the QOSF adapter. */
export const QOSF_README_URL =
  'https://raw.githubusercontent.com/qosf/awesome-quantum-software/master/README.md'

export type QosfFetchOptions = {
  /** Override README URL (tests / pin to a commit). */
  url?: string
}

/** HTTP GET of the QOSF awesome-list README. */
export async function fetchQosfReadme(
  options: QosfFetchOptions = {}
): Promise<string> {
  const url = options.url ?? QOSF_README_URL
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(
      `QOSF README fetch failed: ${res.status} ${res.statusText} (${url})`
    )
  }
  return res.text()
}
