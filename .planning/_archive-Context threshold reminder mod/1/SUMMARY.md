---
phase: 1
status: complete
completed: 2026-11-22
---

# Phase 1: Context reminders - Summary

A one-hook Claude Code mod that toasts a `/clear` reminder at 33% context fill (or the user's first point), again each 10 points after (or the user's step), for 15 seconds (or the user's toast seconds), and starts over when the fill drops below the first point.

## What shipped

- The reminder hook on `session.measure`, toasting through `$.ui.toast` only - `src/headroom.mjs`
- The plugin manifest with the three `number` options `firstPoint`, `step` and `toastSeconds` - `.claude-plugin/plugin.json`
- The hook module wiring - `hooks/hooks.json`, which points at `../src/headroom.mjs`
- Unit tests over the hook's logic - `test/headroom.test.mjs`
- `claude plugin test` tests raising real `session.measure` events - `test/headroom.plugin.test.tsx`
- The CI job `test` with the 85% lines and branches gate on `src/**` - `.github/workflows/test.yml`

## Commits

| Plan | Task | Commit | Description |
|---|---|---|---|
| 1 | 1 | 5c50bd4 | Add the test workflow with the coverage gate |
| 1 | 2 | c4a1035 | Wire the plugin skeleton with a pass-through `session.measure` hook |
| 1 | 3 | c91f850 | Toast a `/clear` reminder at the first point and each step after |
| 1 | 4 | cd6d82b | Restart reminders when the fill drops below the first point |
| 1 | 5 | ca3b400 | Raise real `session.measure` events through `claude plugin test` |

## Deviations

None - plans executed as written. The plugin test file is `.tsx` rather than `.ts` because `node --test` picked up the `.ts` file, a rename the plan allowed. `hooks/headroom.mjs` and `.github/cadence/coverage-policy.json` were declared but not needed, so neither was written.

## Open items

- The live check (AC7) is still John's: run `claude --plugin-dir /code/headroom`, work until the fill reaches 33% or more, and confirm a `/clear` toast stays up about 15 seconds with no transcript line from the mod.
- `claude plugin validate` does not list the three `userConfig` fields, though it raises no warning about them.
- The plugin-directory checks (README, LICENSE, icon) fail only under `--profile directory` and were out of this plan's scope.
- The risk review raised, and its checker refuted against REM-04's wording, a low finding: with the first point set below the fill a fresh window starts at (for example 5% against a 10% baseline), a `/clear` never drops the fill below the first point, so the reminders do not start over (`src/headroom.mjs:14`). REM-04 is marked `[ASSUMPTION]`.

## Goal check

The five commits plausibly deliver the phase goal. The hook toasts when a reading reaches the next point, with `timeoutMs` set from `toastSeconds`, and moves the next point to the reading plus the step (`src/headroom.mjs:9-13`). A reading below the first point resets it (`src/headroom.mjs:14-16`), and a turn with no numeric reading does nothing (`src/headroom.mjs:8`). The defaults 33, 10 and 15 live in the manifest (`.claude-plugin/plugin.json`). The tests cover the default timing, the jump from 33 to 60 giving one toast, options changing the timing, a missing reading and the restart (`test/headroom.test.mjs:52`, `:63`, `:69`, `:76`, `:82`), and through `claude plugin test` the defaults, settings-driven options and a session left untouched (`test/headroom.plugin.test.tsx:25`, `:35`, `:48`). The executor reports the node coverage run at 6 passing with 100% lines and branches, and `claude plugin test` at 3 passing with exit 0. What is not yet shown is the toast in a live session, which is the AC7 open item.

complete locally, not CI-verified
