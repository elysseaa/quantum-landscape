import type { SourceAdapter } from '../types/adapter.ts'
import type { SoftwareEntry } from '../types/software.ts'
import { qosfAdapter } from './adapters/qosf/index.ts'

/**
 * External software feeds compared against OpenQase.
 * Add new adapters here; the fetch:software CLI picks them up automatically.
 */
export const softwareSources: SourceAdapter<SoftwareEntry>[] = [
  qosfAdapter,
]
