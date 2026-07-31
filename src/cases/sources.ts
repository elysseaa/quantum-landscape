import type { SourceAdapter } from '../types/adapter.ts'
import type { CaseEntry } from '../types/cases.ts'
import { arxivAdapter } from './adapters/arxiv.ts'

/**
 * External case-study feeds compared against OpenQase.
 * Add new adapters here; the fetch:cases CLI picks them up automatically.
 */
export const caseSources: SourceAdapter<CaseEntry>[] = [arxivAdapter]
