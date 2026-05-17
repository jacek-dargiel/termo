# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the termo application.

ADRs capture architecturally significant decisions — the context that motivated them, the options considered, and the trade-offs accepted. They answer: **"Why did we do it this way?"**

For the full rules and template, see `.agents/rules/adr.instructions.md`.

## ADR Index

| ADR | Title | Status | Date | Superseded By |
|-----|-------|--------|------|---------------|
| 0001 | Record Architecture Decisions | Accepted | 2026-05-17 | — |
| 0002 | Use Angular Signals for State Management | Accepted | 2026-05-17 | — |

## Process

1. **When:** Write an ADR when making a decision that is architecturally significant, hard to reverse, cross-cutting, or debated.
2. **How:** Copy the template from `.agents/rules/adr.instructions.md`. Start as `Status: Proposed`, discuss with the team, then mark `Accepted`.
3. **Supersede:** If a decision changes, write a new ADR and mark the old one `Superseded by ADR-XXXX`. Cross-link both.
4. **Review:** Scan all ADRs quarterly for stale decisions.

## Updating This Index

When adding a new ADR, add a row to the table above and update the `Superseded By` column on any superseded records.
