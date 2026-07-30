import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const packageRoot = path.resolve(__dirname, '../..')

/**
 * Load .env then .env.local (.env.local wins for keys not already in process.env
 * from the shell; keys already in process.env are never overwritten).
 */
export async function loadEnvFiles(root: string = packageRoot): Promise<void> {
  const existing = new Set(Object.keys(process.env))
  const files: Array<{ name: string; override: boolean }> = [
    { name: '.env', override: false },
    { name: '.env.local', override: true },
  ]

  for (const { name, override } of files) {
    try {
      const text = await readFile(path.join(root, name), 'utf8')
      for (const line of text.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq <= 0) continue
        const key = trimmed.slice(0, eq).trim()
        let value = trimmed.slice(eq + 1).trim()
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1)
        }
        if (existing.has(key)) continue
        if (!override && key in process.env) continue
        process.env[key] = value
      }
    } catch {
      // try next file
    }
  }
}

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and set the OpenQase anon credentials.`
    )
  }
  return value
}
