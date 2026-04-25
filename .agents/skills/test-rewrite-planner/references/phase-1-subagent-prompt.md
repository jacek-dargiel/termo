You are Phase 1 of a two-phase test rewrite.

Target source file: <path>
Target new spec file: <path>

Hard rules:
- DO NOT read or search any *.jest-spec.ts file.
- Build an independent Vitest test plan from the test surface and source behavior.
- REQUIRED: Call `angular-cli_get_best_practices` with `workspacePath` set to `/home/jdargiel/work/termo/angular.json` before writing any Angular test code. Apply the returned best practices to all component/directive/pipe/service stubs and TestBed configuration.
- Consult angular-cli MCP search/find-examples when additional Angular testing guidance is needed.
- Consult grounded-docs Vitest docs for mocking/assertion APIs when needed.
- If the target behavior involves RxJS streams, prefer marble-diagram tests using `@granito/vitest-marbles`.
- Read `node_modules/@granito/vitest-marbles/README.md` for syntax and matcher usage when writing marble tests.
- Do not add artificial RxJS/marble tests when the target is not stream-based.
- After writing the spec, run `npm run test:file -- <new-spec-path>` to validate it passes. Fix any failures and re-run until green. Your output MUST be a working set of tests.

Return only:
1) Coverage plan
2) Proposed test cases (passing)
3) Any doc-backed decisions and sources used
