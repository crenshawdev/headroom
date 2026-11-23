# Requirements: Context threshold reminder mod

**Defined:** 2026-11-22
**Core Value:** When the context fill reaches the point the user set, a toast suggests a `/clear` and stays up long enough to be seen, without adding anything to the transcript or spending tokens.

## Active

Committed scope. Each maps to exactly one roadmap phase.

### Reminders

- [ ] **REM-01**: When the context fill reaches the first reminder point, the user sees a notice on screen suggesting a `/clear`, and it stays up for 15 seconds.
- [ ] **REM-02**: The first reminder point is 33% until the user sets another.
- [ ] **REM-03**: After the first reminder, a new one comes only when the fill has risen another 10 points.
- [ ] **REM-04**: The user can change the step between reminders and how long a notice stays up, and a `/clear` that drops the fill below the first point starts the reminders over. [ASSUMPTION]

### Non-functional

- [ ] **NFR-01**: A reminder adds nothing to the transcript and spends no tokens.

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
*Last updated: 2026-11-22 after starting the project from the Seldon design "Context threshold reminder mod"*
