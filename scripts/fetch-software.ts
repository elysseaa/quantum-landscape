/**
 * Collect external software catalogs and diff vs the OpenQase baseline.
 *
 * Pipeline: sources → collect → dedupe → baseline → diff → write
 *
 * Usage:
 *   npm run fetch:openqase
 *   npm run fetch:software
 */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectSources } from '../src/utils/aggregate.ts'
import { loadSoftwareBaseline } from '../src/software/baseline.ts'
import { dedupeSoftwareEntries } from '../src/software/dedupe.ts'
import { diffAgainstOpenqase } from '../src/software/diff.ts'
import { softwareSources } from '../src/software/sources.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dataDir = path.join(root, 'data')

async function main() {
  const { entries: raw, sourceIds } = await collectSources(softwareSources)
  const external = dedupeSoftwareEntries(raw)
  const baseline = await loadSoftwareBaseline()

  const catalogPath = path.join(dataDir, 'software.json')
  const gapPath = path.join(dataDir, 'software-vs-openqase.json')

  const catalog = {
    fetched_at: new Date().toISOString(),
    sources: sourceIds,
    note: 'Merged external software adapters (OpenQase baseline excluded).',
    count: external.length,
    software: external,
  }

  const report = diffAgainstOpenqase(external, baseline, [
    ...sourceIds,
    'openqase',
  ])

  await mkdir(dataDir, { recursive: true })
  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')
  await writeFile(gapPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log(`Wrote ${catalogPath}`)
  console.log(`  sources: ${sourceIds.join(', ') || '(none)'}`)
  console.log(`  entries: ${external.length} (${raw.length} before dedupe)`)
  console.log(`Wrote ${gapPath}`)
  console.log(`  missing_in_openqase: ${report.counts.missing_in_openqase}`)
  console.log(`  in_both:             ${report.counts.in_both}`)
  console.log(`  openqase_only:       ${report.counts.openqase_only}`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
