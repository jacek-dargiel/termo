# ADR-0001: Record Architecture Decisions

**Status:** Accepted
**Date:** 2026-05-17
**Deciders:** jdargiel
**Owner:** jdargiel

## Context

The project has made several architecturally significant decisions (framework choice, state management, change detection strategy) with no written record of the trade-offs. Future developers — and AI coding agents — have no way to understand *why* these choices were made. Without documentation, decisions risk being re-litigated or inadvertently reversed.

## Decision

We will record all architecturally significant decisions using Architecture Decision Records (ADRs), following the format defined in `.agents/rules/adr.instructions.md`. ADRs are stored in `docs/adr/` as sequential numbered Markdown files (`0001-slug.md`). Each ADR captures the context, decision, alternatives considered, and consequences of a single significant technical choice.

The template is the 5-section Nygard format extended with Alternatives Considered, Re-evaluation Trigger (optional), and References (optional).

## Alternatives Considered

### No formal process
- **Why considered:** Zero overhead. Decisions happen in PR discussions and chat.
- **Why rejected:** Context decays in months. New team members and AI agents have no institutional memory. The cost of a 15-minute ADR is negligible compared to the cost of re-litigating past decisions.

### Log4brains / dedicated ADR tool
- **Why considered:** Generates a static site, prevents numbering collisions, interactive CLI.
- **Why rejected:** Overkill for a 1–3 developer team. Added tooling dependency with no proportional benefit. Manual Markdown in `docs/adr/` is sufficient.

## Consequences

**What gets easier:**
- Onboarding new developers — they read ADRs and understand the architecture's history
- AI coding agents receive past decisions as context, preventing drift and re-deciding
- Design discussions are grounded in written trade-offs, not memory
- Quarterly reviews catch stale assumptions

**What gets harder:**
- Adds ~15 minutes of overhead per significant decision
- Requires discipline to write ADRs during the decision process, not retroactively

