---
name: test-rewrite-planner
description: |-
  Plan and execute Angular test rewrites in two phases: independent initial implementation, then legacy-spec refinement. Use for migrating *.jest-spec.ts tests to Vitest while preserving behavior and adding missing coverage. Use proactively when rewriting old tests, replacing Jest patterns, or validating parity between new and legacy specs.

  Examples:
  - user: "Rewrite tests for src/app/pipes/x.pipe.ts" → create phase-1 tests without reading old jest specs, then run phase-2 gap analysis against x.pipe.jest-spec.ts
  - user: "Migrate this component test from Jest to Vitest" → produce Vitest-native spec first, then compare with legacy spec and patch gaps
  - user: "Replace old *.jest-spec.ts files safely" → perform two-phase rewrite, verify parity, run tests, and provide cleanup recommendation
  - user: "Plan a test rewrite mini-project" → generate phased plan, execute both subagent passes, and report missing/added coverage
compatibility: "Requires angular-cli MCP and grounded-docs MCP; uses Task subagents (general or explore)."
---

# Test Rewrite Planner

## Goal

Run a strict two-phase rewrite flow for Angular unit tests:
- Phase 1 builds a fresh Vitest spec from the test surface only.
- Phase 2 compares against the corresponding legacy `.jest-spec.ts` file to find gaps and refine.

## Non-Negotiable Rules

- Spin up a subagent for each phase using the `task` tool.
- Do not read any `*.jest-spec.ts` file during Phase 1.
- Read the corresponding `.jest-spec.ts` file during Phase 2 and perform explicit gap analysis.
- In both phases, consult docs when needed:
  - Angular guidance via angular-cli MCP (`angular-cli_list_projects`, `angular-cli_get_best_practices`, `angular-cli_search_documentation`).
  - Vitest guidance via grounded-docs MCP (`grounded-docs_search_docs`; list libs if needed).
- For RxJS stream behavior, prefer marble-diagram tests in Phase 1 using `@granito/vitest-marbles`.
- Do not invent RxJS/marble tests when the code under test is not stream-based.

## Workflow

### Phase 1: Initial Test Implementation (Subagent)

1. Prepare context in main agent:
   - Identify source under test and current test runner/config.
   - Gather Angular project context with `angular-cli_list_projects`.
2. Launch subagent with `task`.
   - Recommended `subagent_type`: `general`.
   - Include a hard constraint: do not open/read/search `*.jest-spec.ts` files.
3. Phase-1 subagent responsibilities:
   - Read only production/test-support files relevant to behavior.
   - Use Angular docs/best practices if any Angular testing pattern is uncertain.
   - Use grounded-docs for Vitest APIs (mocking/spies/timers/globals) when needed.
   - If testing RxJS streams, prefer marble diagrams via `@granito/vitest-marbles`; consult `node_modules/@granito/vitest-marbles/README.md` for matcher/syntax details.
   - Produce:
     - proposed test plan,
     - initial Vitest spec content,
     - rationale for each covered case.

### Phase 2: Refined Test Refactor (Subagent)

1. Launch a second subagent with `task`.
   - Recommended `subagent_type`: `general`.
   - Require it to read the matching legacy `.jest-spec.ts` file.
2. Phase-2 subagent responsibilities:
   - Compare old spec coverage vs Phase-1 tests.
   - Identify missed cases, redundant cases, and outdated assertions.
   - Validate any migration-specific API usage with grounded-docs.
   - Validate Angular test style with angular-cli docs when needed.
   - Return a concrete patch plan:
     - what to add,
     - what to keep,
     - what to drop.

### Finalization in Main Agent

1. Apply phase-2 refinements to the new `*.spec.ts`.
2. Verify the plan checklist is fully satisfied.
3. Run tests (`npm run test` or targeted equivalent).
4. Report final comparison summary:
   - retained coverage,
   - newly added coverage,
   - intentionally omitted legacy checks (with reason).
5. Provide a cleanup recommendation for legacy `.jest-spec.ts` files instead of deleting them by default.

## Subagent Prompt Templates

- Phase 1 template: `references/phase-1-subagent-prompt.md`
- Phase 2 template: `references/phase-2-subagent-prompt.md`

Load and adapt these templates per target file paths before launching each `task` subagent.

## Completion Checklist

- Phase 1 subagent executed and respected no-legacy-spec rule.
- Phase 2 subagent executed and reviewed corresponding legacy spec.
- Angular and Vitest docs consulted when uncertainty existed.
- New spec reflects behavior parity plus justified improvements.
- Legacy `.jest-spec.ts` cleanup recommendation provided (not auto-deleted).
- Tests pass.
