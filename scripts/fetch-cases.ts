/**
 * Collect external case-study candidates and diff vs the OpenQase baseline.
 *
 * Pipeline: sources → collect → dedupe → baseline → diff → write
 *
 * Usage:
 *   npm run fetch:openqase
 *   npm run fetch:cases
 */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectSources } from '../src/utils/aggregate.ts'
import { loadCasesBaseline } from '../src/cases/baseline.ts'
import { dedupeCaseEntries } from '../src/cases/dedupe.ts'
import { diffCasesAgainstOpenqase } from '../src/cases/diff.ts'
import { caseSources } from '../src/cases/sources.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dataDir = path.join(root, 'data')

async function main() {
  const { entries: raw, sourceIds } = await collectSources(caseSources)
  const external = dedupeCaseEntries(raw)
  const baseline = await loadCasesBaseline()

  const catalogPath = path.join(dataDir, 'cases.json')
  const gapPath = path.join(dataDir, 'cases-vs-openqase.json')

  const catalog = {
    fetched_at: new Date().toISOString(),
    sources: sourceIds,
    note: 'Merged external case adapters (OpenQase baseline excluded).',
    count: external.length,
    cases: external,
  }

  const report = diffCasesAgainstOpenqase(external, baseline, [
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
