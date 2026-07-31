import {
  canonicalGithubUrl,
  parseGithubRepo,
  slugify,
} from '../../../utils/normalize.ts'
import type { SoftwareEntry } from '../../../types/software.ts'

const SKIP_SECTIONS = new Set(['contents', 'contributing', 'license'])

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g
const LIST_ITEM_RE = /^- \[([^\]]+)\]\(([^)]+)\)(.*)$/

/**
 * Parse QOSF awesome-quantum-software README markdown into SoftwareEntry rows.
 * Pure function — no I/O.
 */
export function parseQosfReadme(
  markdown: string,
  options: { includeAbandoned?: boolean } = {}
): SoftwareEntry[] {
  const includeAbandoned = options.includeAbandoned ?? false
  const entries: SoftwareEntry[] = []

  let category: string | undefined
  let language: string | undefined
  let abandoned = false
  let lineNo = 0

  for (const rawLine of markdown.split(/\r?\n/)) {
    lineNo += 1
    const line = rawLine.trimEnd()

    const heading = /^##\s+(.+)$/.exec(line)
    if (heading) {
      const title = heading[1].trim()
      const key = title.toLowerCase()
      if (SKIP_SECTIONS.has(key)) {
        category = undefined
        language = undefined
        abandoned = false
        continue
      }
      if (key === 'abandoned projects') {
        abandoned = true
        category = title
        language = undefined
        continue
      }
      abandoned = false
      category = title
      language = undefined
      continue
    }

    if (!category) continue
    if (abandoned && !includeAbandoned) continue

    const langHeading = /^\*\*(.+)\*\*$/.exec(line.trim())
    if (langHeading) {
      language = langHeading[1].trim()
      continue
    }

    const list = LIST_ITEM_RE.exec(line.trim())
    if (!list) continue

    const firstName = list[1].trim()
    const firstUrl = list[2].trim()
    const rest = list[3] ?? ''

    const links: { name: string; url: string }[] = [
      { name: firstName, url: firstUrl },
    ]
    for (const m of rest.matchAll(LINK_RE)) {
      links.push({ name: m[1].trim(), url: m[2].trim() })
    }

    const description = rest
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '')
      .replace(/^\s*[-–—:]\s*/, '')
      .replace(/\s+/g, ' ')
      .trim()

    const githubLink = links.find((l) => parseGithubRepo(l.url))
    const githubRepo = githubLink ? parseGithubRepo(githubLink.url) : undefined

    const primary = links[0]
    entries.push(
      buildEntry({
        name: primary.name,
        primaryUrl: primary.url,
        githubRepo,
        description: description || undefined,
        category,
        language,
        abandoned,
        ref: `L${lineNo}`,
      })
    )

    for (const extra of links.slice(1)) {
      const extraRepo = parseGithubRepo(extra.url)
      if (!extraRepo && !looksLikeProjectName(extra.name, primary.name)) continue
      if (slugify(extra.name) === slugify(primary.name)) continue
      entries.push(
        buildEntry({
          name: extra.name,
          primaryUrl: extra.url,
          githubRepo: extraRepo,
          description: description || undefined,
          category,
          language,
          abandoned,
          ref: `L${lineNo}`,
        })
      )
    }
  }

  return dedupeEntries(entries)
}

function looksLikeProjectName(name: string, primaryName: string): boolean {
  if (name === primaryName) return false
  const lower = name.toLowerCase()
  if (
    lower === 'docs' ||
    lower === 'documentation' ||
    lower === 'paper' ||
    lower === 'arxiv paper' ||
    lower === 'blog post' ||
    lower.startsWith('http')
  ) {
    return false
  }
  if (name.endsWith("'s") || name.endsWith('’s')) return false
  if (name.length <= 2) return false
  return true
}

function buildEntry(args: {
  name: string
  primaryUrl: string
  githubRepo?: string
  description?: string
  category?: string
  language?: string
  abandoned?: boolean
  ref?: string
}): SoftwareEntry {
  const github =
    args.githubRepo ?? parseGithubRepo(args.primaryUrl) ?? undefined
  return {
    name: args.name,
    slug: slugify(args.name),
    description: args.description,
    category: args.category,
    language: args.language,
    urls: {
      primary: args.primaryUrl,
      github: github ? canonicalGithubUrl(github) : undefined,
    },
    githubRepo: github,
    abandoned: args.abandoned || undefined,
    source: { id: 'qosf', ref: args.ref },
  }
}

function dedupeEntries(entries: SoftwareEntry[]): SoftwareEntry[] {
  const byKey = new Map<string, SoftwareEntry>()
  for (const e of entries) {
    const key = e.githubRepo ?? `slug:${e.slug}:${e.category ?? ''}`
    const prev = byKey.get(key)
    if (!prev) {
      byKey.set(key, e)
      continue
    }
    if (!prev.githubRepo && e.githubRepo) byKey.set(key, e)
  }
  return [...byKey.values()]
}
