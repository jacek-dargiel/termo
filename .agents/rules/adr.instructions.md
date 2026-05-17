---
applyTo: "docs/adr/**.md"
---
# Architecture Decision Records

## Definition

An ADR is a short (1–2 page), lightweight markdown document capturing a single architecturally significant design decision — its context, the decision itself, and its consequences. First formalized by Michael Nygard (2011). They answer the question: **"Why did we do it this way?"**

## When to Write an ADR

Write one when the decision is:
- **Architecturally significant** — affects structure, non-functional characteristics, dependencies, interfaces, or construction techniques
- **Hard or expensive to reverse** — a rule of thumb: if reversing requires more than a day of work
- **Cross-cutting** — affects multiple components, services, or patterns
- **Had genuine debate** — multiple viable options existed and the team deliberated

Do **not** write ADRs for: routine code changes, formatting choices, trivial implementation details, decisions with only one obvious option.

## Writing Rules

1. **Write during the decision process**, not months later. Start as `Status: Proposed`, discuss, then mark `Accepted`.
2. **Keep it 1–2 pages max.** If you need 4,000 words, you need a design doc, not an ADR.
3. **Use active voice, present tense:** "We use PostgreSQL", not "It was decided that PostgreSQL would be utilized."
4. **State the decision clearly.** Canonical structure: *"In the context of [situation], facing [concern], we decided [decision] to achieve [goal], accepting [tradeoff]."*
5. **Always list alternatives considered** — at least 2. This prevents future engineers from re-litigating the same debate.
6. **Always include negative consequences.** An ADR with only benefits is a sales pitch, not a record.
7. **Make ADRs immutable once accepted.** Never edit an accepted ADR. If the decision changes, write a new ADR that supersedes the old one.
8. **Cross-link superseded/superseding ADRs in both directions.**
9. **Name a single owner** — not "the team". One person who knows the decision if questions arise.
10. **Never delete old ADRs** — even rejected or superseded ones. They form the architectural timeline.

## File Naming

Use sequential zero-padded numbering:

```
docs/adr/0001-record-architecture-decisions.md
docs/adr/0002-use-angular-standalone-components.md
docs/adr/0003-use-ngrx-for-state-management.md
```

This produces short, memorable IDs (`ADR-0003`) that can be referenced in commits, code comments (`// ADR-0003`), and conversation. Merge conflicts on sequential numbers are rare for a small team (1–3 devs).

## Directory Structure

```
docs/
└── adr/
    ├── README.md                    # Index of all ADRs + process description
    ├── 0001-record-architecture-decisions.md
    ├── 0002-{title-slug}.md
    └── ...
```

The `README.md` must contain a table:

```markdown
| ADR | Title | Status | Date |
|-----|-------|--------|------|
| 0001 | Record Architecture Decisions | Accepted | 2026-05-17 |
| 0002 | Use Angular Standalone Components | Accepted | 2026-05-17 |
```

## Template

Every ADR follows this structure:

```markdown
# ADR-{NNNN}: {Short Title — Present Tense, Imperative Mood}

**Status:** Proposed | Accepted | Deprecated | Superseded by [ADR-XXXX]
**Date:** YYYY-MM-DD
**Deciders:** {name, name}
**Owner:** {single name}

## Context

{2–4 sentences. No more than 6.}

What situation exists? What problem are we solving? What constraints or forces are at play? What would happen if we did nothing?

Write this so someone joining the project in 2 years understands WHY this decision needed to be made, even if the code has changed.

## Decision

{1–3 sentences. Active voice. Present tense.}

"We will…" / "We use…"

Be specific. Name the technology, pattern, or approach explicitly.

A good test: can a future developer read only this section and know what we chose?

## Alternatives Considered

### {Alternative 1}: {Brief description}
- **Why considered:** {1 sentence}
- **Why rejected:** {1 sentence}

### {Alternative 2}: {Brief description}
- **Why considered:** {1 sentence}
- **Why rejected:** {1 sentence}

{At least 2 alternatives.}

## Consequences

**What gets easier:**
- {Benefit 1}
- {Benefit 2}

**What gets harder:**
- {Cost/risk 1}
- {Cost/risk 2}

{If you cannot list at least one cost, you haven't thought hard enough. Every decision has trade-offs.}

## Re-evaluation Trigger (optional)

Reconsider this decision if:
- {Condition that would invalidate this ADR}
- {e.g., framework version changes, team size doubles, cost exceeds X}

## References (optional)

- Related ADRs: [ADR-{NNNN}]
- External: {URL}
```

## Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| Writing ADRs months after the decision | Write during or right after the decision meeting |
| ADRs longer than 2 pages | Link to supporting docs. Cap at 2 pages |
| Missing alternatives | Always list 2–3 alternatives with rejection reasons |
| Omitting negative consequences | Force at least one cost/risk in the Consequences section |
| Editing accepted ADRs | Write a new ADR that supersedes the old one |
| Deleting deprecated ADRs | Mark as `Deprecated` or `Superseded by ADR-XXX` |
| Stale statuses (Accepted but not true anymore) | Review ADRs quarterly |
| "The team" as owner | Always name a single person |
| Missing cross-links on supersession | Cross-link both directions |
| Storing ADRs in Confluence/wiki | Store in `docs/adr/` in the repo |
| Vague decisions ("use microservices for scalability") | Be specific about what, why, and scope |

## The First ADR

The first ADR must always be `0001-record-architecture-decisions.md`, documenting that the project uses ADRs, following this format, stored in `docs/adr/`. This establishes the practice for anyone joining the project.

## Integration with AI Agents

ADRs are the institutional memory that AI coding agents lack across sessions. Every new agent session starts with no memory of past decisions.

- **Point AGENTS.md at ADRs.** Include: `docs/adr/README.md — Architecture Decision Records; read before making structural changes.`
- **ADRs prevent re-deciding.** An agent that reads existing ADRs before proposing changes is less likely to contradict earlier decisions.
- **Code comments can reference ADRs:** `// ADR-0004: Chose signals over NgRx for state management`
- **Write ADRs for agent consumption too.** Agents parse the structured template better than ad-hoc docs.

## Maintenance

- **Quarterly review:** Scan all ADRs for stale decisions. 15 minutes per quarter.
- **Supersession workflow:** New PR with new ADR → mark old ADR `Superseded by ADR-XXXX` → cross-link both → merge.
- **Status lifecycle:** `Proposed` → `Accepted` (or `Rejected`) → `Deprecated` (or `Superseded`).
