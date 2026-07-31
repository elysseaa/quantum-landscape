/** Lowercase slug: letters/digits only, hyphens for separators. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/#/g, 'sharp')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Parse github.com/owner/repo from a URL. Ignores tree/blob paths beyond the repo.
 */
export function parseGithubRepo(url: string): string | undefined {
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()
    if (host !== 'github.com' && host !== 'www.github.com') return undefined
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length < 2) return undefined
    const [owner, repoRaw] = parts
    if (!owner || !repoRaw) return undefined
    const blocked = new Set(['orgs', 'users', 'settings', 'topics', 'sponsors'])
    if (blocked.has(owner.toLowerCase())) return undefined
    const repo = repoRaw.replace(/\.git$/i, '')
    return `${owner}/${repo}`.toLowerCase()
  } catch {
    return undefined
  }
}

export function canonicalGithubUrl(ownerRepo: string): string {
  return `https://github.com/${ownerRepo}`
}
