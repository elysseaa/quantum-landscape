# quantum-landscape

Local scripts to survey the quantum open-source landscape and compare it to
[OpenQase](https://openqase.com).

## Planned capabilities

1. **`npm run snapshot`** — pull published OpenQase `quantum_software` (+ case study titles) via the public anon API into `data/openqase-snapshot.json`
2. **`npm run fetch:qosf`** — parse QOSF awesome-quantum-software → gap list vs snapshot *(not implemented yet)*
3. **`npm run fetch:cases`** — arXiv + blog RSS → case-study *candidates* for human review *(not implemented yet)*
4. **`npm run report`** — write `data/RUN_REPORT.md` *(not implemented yet)*

Outputs are review lists by default. Draft import stubs are optional and only when field quality is good enough.

## Setup

```bash
cp .env.example .env.local
# Fill OPENQASE_SUPABASE_URL + OPENQASE_SUPABASE_ANON_KEY (anon / publishable only)
npm install
npm run snapshot
```

## Layout

```
scripts/     TypeScript one-shot tools
data/        JSON snapshots and gap/candidate lists (generated)
```
