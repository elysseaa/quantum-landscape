# quantum-landscape

Local scripts to survey the quantum open-source landscape and compare it to
[OpenQase](https://openqase.com).

## Capabilities

1. **`npm run fetch:openqase`** — pulls published OpenQase software + case studies via anon API → `data/openqase.json`
2. **`npm run fetch:software`** — pulls from external software sources → produces catalog + gap vs OpenQase
3. **`npm run fetch:cases`** — pulls from external case study sources → produces catalog + gap vs OpenQase

Outputs are JSON review lists by default. No writes to OpenQase are made.

## Setup

```bash
cp .env.example .env.local
# Fill OPENQASE_SUPABASE_URL + OPENQASE_SUPABASE_ANON_KEY (anon / publishable only)
npm install
npm run fetch:openqase
npm run fetch:software
npm run fetch:cases
```

## Content pipeline (software & cases)

All content types follow the same steps.

```
CLI (scripts/fetch-<domain>.ts)
  1. sources.ts          list external SourceAdapters
  2. collectSources()    each adapter.fetch() → concatenate
  3. dedupe.ts           collapse duplicates across sources
  4. baseline.ts         load OpenQase slice from data/openqase.json
  5. diff.ts             external vs baseline → gap report
  6. write data/         <domain>.json + <domain>-vs-openqase.json
```

| Step | Role |
|------|------|
| **Adapter** (`adapters/`) | External feed → domain entries |
| **Dedupe** | Merge among *external* sources (same GitHub / arXiv id) |
| **Baseline** | Map cached OpenQase rows → set entry shape |
| **Diff** | Gap report vs baseline |

`fetch:openqase` is separate: it refreshes the shared baseline file that every domain’s `baseline.ts` reads.

## Standard domain folder

Each content type under `src/<domain>/` should look like:

```
src/<domain>/
  sources.ts       # SourceAdapter<Entry>[] - list of feeds to read from
  adapters/        # one folder/file per external feed (fetch + parse)
  dedupe.ts        # Entry[] → Entry[] across sources - removes duplicates from collective feed output
  baseline.ts      # data/openqase.json → Entry[] - collects data obtained from fetch:openqase and formats them into Entry[]
  diff.ts          # (external, baseline) → gap report
  aliases.ts       # optional domain-specific key aliases
```

Shared pieces stay outside domains:

- `src/types/` — `SourceAdapter<T>`, `SoftwareEntry`, `CaseEntry`, `openqase.ts` (catalog DTOs), …
- `src/utils/` — `collectSources`, `slugify`, `resolveAlias`, env helpers
- `src/openqase/` — live fetch + read of `data/openqase.json`

### arXiv usage

`src/cases/adapters/arxiv/fetch.ts` follows the [arXiv API Terms of Use](https://info.arxiv.org/help/api/tou.html): one request at a time, ≥3s between requests if paging, identifying User-Agent, and **metadata only** (no PDF re-hosting). Default query is `cat:quant-ph` with `max_results=50`.
