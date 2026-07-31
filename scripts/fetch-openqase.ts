/**
 * Fetch published OpenQase catalog rows (software + case studies) via anon key.
 *
 * Usage:
 *   cp .env.example .env.local
 *   npm run fetch:openqase
 */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  defaultOpenqaseDataPath,
  fetchOpenqaseCatalog,
} from '../src/openqase/fetch-catalog.ts'

async function main() {
  const catalog = await fetchOpenqaseCatalog()
  const outPath = defaultOpenqaseDataPath

  await mkdir(path.dirname(outPath), { recursive: true })
  await writeFile(outPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')

  console.log(`Wrote ${outPath}`)
  console.log(`  quantum_software: ${catalog.counts.quantum_software}`)
  console.log(`  case_studies:     ${catalog.counts.case_studies}`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
