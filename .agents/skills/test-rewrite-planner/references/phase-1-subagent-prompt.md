You are Phase 1 of a two-phase test rewrite.

Target source file: <path>
Target new spec file: <path>

Hard rules:
- DO NOT read or search any *.jest-spec.ts file.
- Build an independent Vitest test plan from the test surface and source behavior.
- Consult angular-cli MCP docs/best-practices if Angular testing conventions are relevant.
- Consult grounded-docs Vitest docs for mocking/assertion APIs when needed.
- If the target behavior involves RxJS streams, prefer marble-diagram tests using `@granito/vitest-marbles`.
- Read `node_modules/@granito/vitest-marbles/README.md` for syntax and matcher usage when writing marble tests.
- Do not add artificial RxJS/marble tests when the target is not stream-based.

Return only:
1) Coverage plan
2) Proposed test cases
3) Any doc-backed decisions and sources used
