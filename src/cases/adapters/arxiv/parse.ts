import { slugify } from '../../../utils/normalize.ts'
import type { CaseEntry } from '../../../types/cases.ts'

/**
 * Parse arXiv Atom API XML into CaseEntry rows.
 * Pure function — no I/O. Metadata fields only (title, summary, ids, links).
 */
export function parseArxivAtom(xml: string): CaseEntry[] {
  const entries: CaseEntry[] = []
  const entryBlocks = xml.match(/<entry\b[^>]*>[\s\S]*?<\/entry>/gi) ?? []

  for (const block of entryBlocks) {
    const idUrl = textContent(block, 'id')
    const title = cleanText(textContent(block, 'title'))
    if (!title) continue

    const arxivId = normalizeArxivId(idUrl) ?? normalizeArxivId(title)
    const published = textContent(block, 'published')
    const year = published ? Number(published.slice(0, 4)) : null
    const summary = cleanText(textContent(block, 'summary'))
    const absUrl =
      attrHref(block, 'rel="alternate"') ??
      (arxivId ? `https://arxiv.org/abs/${arxivId}` : undefined)

    entries.push({
      title,
      slug: slugify(title),
      description: summary || undefined,
      year: Number.isFinite(year) ? year : null,
      urls: {
        primary: absUrl ?? `arxiv:${arxivId ?? slugify(title)}`,
        arxiv: absUrl,
      },
      arxivId: arxivId ?? undefined,
      source: {
        id: 'arxiv',
        ref: arxivId ?? idUrl ?? undefined,
      },
    })
  }

  return entries
}

/** Strip version suffix: 1912.06070v2 → 1912.06070 */
export function normalizeArxivId(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const fromUrl = /arxiv\.org\/abs\/([0-9]+\.[0-9]+)(v\d+)?/i.exec(raw)
  if (fromUrl) return fromUrl[1]
  const fromId = /\b([0-9]{4}\.[0-9]{4,5})(v\d+)?\b/.exec(raw)
  if (fromId) return fromId[1]
  // Legacy: hep-th/9901001
  const legacy = /arxiv\.org\/abs\/([a-z-]+\/[0-9]+)(v\d+)?/i.exec(raw)
  if (legacy) return legacy[1].toLowerCase()
  return undefined
}

function textContent(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const m = re.exec(block)
  return m ? decodeXmlEntities(m[1]) : undefined
}

function attrHref(block: string, attrFragment: string): string | undefined {
  const re = new RegExp(
    `<link\\b[^>]*${attrFragment}[^>]*href=["']([^"']+)["'][^>]*/?>`,
    'i'
  )
  const m = re.exec(block)
  if (m) return m[1]
  const re2 = new RegExp(
    `<link\\b[^>]*href=["']([^"']+)["'][^>]*${attrFragment}[^>]*/?>`,
    'i'
  )
  const m2 = re2.exec(block)
  return m2?.[1]
}

function cleanText(value: string | undefined): string {
  if (!value) return ''
  return value.replace(/\s+/g, ' ').trim()
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&')
}
