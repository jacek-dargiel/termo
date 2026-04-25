You are Phase 2 of a two-phase test rewrite.

Target source file: <path>
New spec file: <path>
Legacy spec file: <path>.jest-spec.ts

Rules:
- Read the legacy .jest-spec.ts file and compare it with the new spec.
- Identify coverage gaps from phase 1.
- Keep meaningful behavior checks; avoid carrying over obsolete implementation-coupled tests.
- REQUIRED: Call `angular-cli_get_best_practices` with `workspacePath` set to `/home/jdargiel/work/termo/angular.json` to validate Phase 1's test patterns against current Angular conventions.
- Consult angular-cli MCP search/find-examples and grounded-docs MCP when needed to validate testing patterns.

Return only:
1) Gap analysis table (missed/covered/not-needed)
2) Exact edits required to close gaps
3) Final parity verdict
