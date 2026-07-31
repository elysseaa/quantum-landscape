import { readFile } from 'node:fs/promises'
import { defaultOpenqaseDataPath } from './fetch-catalog.ts'
import type { OpenqaseCatalog } from '../types/openqase.ts'

export async function readOpenqaseCatalog(
  dataPath: string = defaultOpenqaseDataPath
): Promise<OpenqaseCatalog> {
  const text = await readFile(dataPath, 'utf8')
  return JSON.parse(text) as OpenqaseCatalog
}
