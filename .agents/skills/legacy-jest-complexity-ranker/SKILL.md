---
name: legacy-jest-complexity-ranker
description: |-
  Rank legacy Angular `*.jest-spec.ts` files by migration complexity using the project tool at `bin/rank-legacy-jest-specs.mjs`. Use for choosing the safest first rewrite target, generating easiest-file shortlists, and producing transparent score breakdowns. Use proactively when a user asks where to start Jest→Vitest migration, requests the simplest legacy spec, or wants objective triage across many legacy tests.

  Examples:
  - user: "Which legacy jest spec should we migrate first?" → run ranking tool and return the winner with rationale
  - user: "Give me the 10 easiest legacy test files" → run with `--top 10` and summarize shortlist
  - user: "Export complexity results for automation" → run with `--json` and return parsed key findings
  - user: "Find the least complicated reducer spec" → run ranking, filter by reducer paths, and report easiest match
---

# Legacy Jest Complexity Ranker

## Goal

Select migration targets with low conceptual risk by prioritizing framework complexity before file size.

## Primary Command

- Run from repo root: `npm run test:legacy:rank`

## Optional Modes

- Top-N shortlist: `npm run test:legacy:rank -- --top 10`
- Machine-readable output: `npm run test:legacy:rank -- --json`

## Agent Workflow

1. Run the ranking command.
2. Read the winner and top shortlist from command output.
3. Explain why the winner is simple using the reported metrics (`TestBed`, `DOM`, `NGRX`, `rxjs`, test count, nonempty lines).
4. If user asks for "subjectively least complicated," interpret as:
   - First: low framework/dependency complexity (`NGRX`, `DOM`, `TestBed`, `rxjs`).
   - Second: low mechanical complexity (tests, hooks, line count).
5. If user asks for a scoped result (services, reducers, components), run with `--json` and filter paths before reporting.

## Reporting Template

- Winner: `<path>` (score `<score>`)
- Why: `<1-2 lines referencing metrics>`
- Next easiest: `<2-5 candidate files>`
- Suggested next action: migrate winner first, then rerun ranking after each rewrite or deletion.

## Notes

- Lower score means simpler file.
- The scoring weights live in `bin/rank-legacy-jest-specs.mjs`; adjust only when user asks to change ranking behavior.
