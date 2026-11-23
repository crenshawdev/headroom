# Requirements: Context threshold reminder mod

**Defined:** 2026-11-22
**Core Value:** When the context fill reaches the point the user set, a toast suggests a `/clear` and stays up long enough to be seen, without adding anything to the transcript or spending tokens.

## Active

No cycle open. The ids the last milestone shipped are in `## Shipped` below, and `/cad-phase add` opens the next cycle.

## Shipped

Delivered and verified. Kept as rows for shipped-scope trace; git history
holds the full requirement text. Archived out of `## Traceability` so a new
milestone's audit starts clean (the audit seam parses only the Traceability
table).

| Requirement | Phase | Status | Milestone |
|-------------|-------|--------|-----------|
| REM-01 | 1 | Complete | Context threshold reminder mod |
| REM-02 | 1 | Complete | Context threshold reminder mod |
| REM-03 | 1 | Complete | Context threshold reminder mod |
| REM-04 | 1 | Complete | Context threshold reminder mod |
| NFR-01 | 1 | Complete | Context threshold reminder mod |

## v2 Requirements

Deferred. Tracked, not in the current roadmap.

None.

## Out of Scope

Explicit exclusions. The reason prevents scope creep later.

| Feature | Reason |
|---------|--------|
| It won't run `/clear` itself | The user decides when to clear. |
| It won't nag | The user decides when to clear. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|

Bare headers - `/cad-plan` seeds a row per requirement when its phase is
planned (`references/req-traceability.md`).

---
*Last updated: 2026-11-22 after closing the milestone "Context threshold reminder mod"*
