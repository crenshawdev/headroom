# Phase 1: Context reminders - Context

Gathered: 2026-11-22
Feeds: /cad-plan 1

## Scope boundary

In: One mod in this repo: a hook module under `src/` on `session.measure` that shows a toast suggesting `/clear` at the first point and again each time the fill has risen another step; its three settings in `plugin.json` `userConfig`; `hooks/hooks.json`; a `node:test` suite and `claude plugin test` files; a CI workflow with a job named `test`.
Out: Running `/clear` itself; nagging; saving anything between sessions; any output other than `$.ui.toast`, so nothing reaches the transcript or the model.
Deferred: None
Plan shape: one plan

## Durable decisions

- D-01 (stack): The mod is one JavaScript module. The mod is written in plain JavaScript, as one ES module that Claude Code loads. [ASSUMPTION] Evidence: S-01 of the Seldon design "Context threshold reminder mod".
- D-02 (hosting): It runs as a Claude Code mod in the user's own session. The reminder runs inside the user's Claude Code session on their own machine, as a mod, with no server or outside service. Evidence: S-02 of the Seldon design "Context threshold reminder mod".
- D-03 (design approach): One hook on session.measure, with a toast as the only output. All the reminder logic sits in one hook on `session.measure`. It reads `e.context.percent` and shows reminders only through `$.ui.toast`, so nothing reaches the transcript or the model. Evidence: S-03 of the Seldon design "Context threshold reminder mod".
- D-04 (how state changes): The next reminder point lives in memory for the session. The hook keeps the next reminder point in memory. It starts at the first point, rises by the step after each reminder, and goes back to the first point when the fill drops below it, as after a `/clear`. Nothing is saved between sessions. [ASSUMPTION] Evidence: S-04 of the Seldon design "Context threshold reminder mod".
- D-05 (who owns shared data): The user's settings own the three numbers. The first point, the step and how long a toast stays up come from the mod's options, which the user sets: 33%, 10 points and 15 seconds unless the user changes them. The hook reads them and never changes them. Evidence: S-05 of the Seldon design "Context threshold reminder mod".

## Decisions

- D-06 (reading the fill): `e.context.percent` is a whole number from 0 to 100 and can be missing. The hook acts only on a number; a missing reading shows no toast and does not reset the next point. Evidence: `claude-code.d.ts` (Claude Code 2.1.330 types, written by the plugin-authoring skill) lines 14595-14620.
- D-07 (reading the fill): Reminders come only after a turn. `session.measure` fires after each main-thread turn and when a rate-limit window moves, and nothing fires at the moment of a `/clear`, so the reset happens on the first context reading after the next turn. The hook acts only on context readings. Evidence: `claude-code.d.ts` lines 5866-5879.
- D-08 (toast): A toast stays up for the toast-seconds setting times 1000, passed as `timeoutMs` (the engine default is 4000). A new toast from the mod replaces its earlier one. Evidence: `claude-code.d.ts` lines 2858-2875; plugin-authoring `reference.md` line 216.
- D-09 (next point): After a reminder, the next point is the fill at that reminder plus the step, so a jump from 33% to 60% puts the next reminder at 70%. Evidence: John's answer in /cad-context 1; REQUIREMENTS.md REM-03.
- D-10 (next point): The next point is kept in a plain module variable, not `$.state` or `$.store`. A `/config` change reloads the mod and resets the point to the first point, so a toast can show again on the next turn after a settings change; that is accepted. Evidence: plugin-authoring `reference.md` lines 121-122 and 203; plugin-authoring `examples/band.tsx` lines 12-13.
- D-11 (settings): The three numbers are `number` fields in `plugin.json` `userConfig`: first point (default 33), step (default 10) and toast seconds (default 15). The user changes them in `/config` or in settings.json `pluginConfigs[<name>].options`, and a `/config` change reloads the mod. Evidence: `claude-code.d.ts` lines 9820-9835; plugin-authoring `reference.md` line 123.
- D-12 (settings): The min and max bounds go in the manifest only; the hook does not clamp. Evidence: John's answer in /cad-context 1.
- D-13 (packaging): The repo root is the plugin folder: `.claude-plugin/plugin.json`, and `hooks/hooks.json` pointing at the module under `src/`. It loads with `claude --plugin-dir /code/headroom` or `CLAUDE_CODE_PLUGIN_DIRS`. Evidence: plugin-authoring `reference.md` lines 11-14 and 121-123; `.github/cadence/coverage-policy.json` (coverage covers `src/**` only).
- D-14 (tests): Two kinds of tests: a `node:test` suite that drives `register` with fakes and feeds the 85% line and branch gate on `src/**`, and `claude plugin test` files (`*.test.ts`, importing `claude-code/testing`) that raise real `session.measure` events. Evidence: `claude plugin test --help`; plugin-authoring `examples/pane.test.tsx`; `.github/cadence/coverage-policy.json`.
- D-15 (CI): The CI job `test` runs `node --test` with the coverage commands only; `claude plugin test` is a local check before landing. Evidence: John's answer in /cad-context 1; `.planning/config.json` `testing.required_jobs`.

## Acceptance criteria

- [ ] AC1: With the default settings, tests feed readings of 32%, 33%, 40%, 42% and 43%. One toast naming `/clear`, with `timeoutMs` 15000, shows at 33%, none shows at 40% or 42%, and the next shows at 43%.
- [ ] AC2: With the default settings, a reading of 60% right after 20% shows exactly one toast. Readings of 61% to 69% show none, and 70% shows the next.
- [ ] AC3: After a toast at 43%, a reading of 10% and then 33% shows a toast at 33%. A missing reading in between shows no toast and leaves the next point where it was.
- [ ] AC4: With the options set to first point 20, step 5 and toast seconds 30, a reading of 20% shows a toast with `timeoutMs` 30000, and the next one shows at 25%.
- [ ] AC5: `claude plugin validate /code/headroom` passes and lists `session.measure` as the only event hooked and `$.ui.toast` as the only `$` call.
- [ ] AC6: The coverage commands in `.github/cadence/coverage-policy.json` pass (85% of lines and branches on `src/**`), and `claude plugin test /code/headroom` exits 0.
- [ ] AC7: In a session started with `claude --plugin-dir /code/headroom`, a toast suggesting `/clear` shows once the fill reaches the first point, and the transcript gets no line from the mod. (human-verify: needs a live Claude Code session)

## Flagged assumptions

- `claude plugin test` runs with no Claude login or network - Unclear; if wrong: it can only ever run locally, which D-15 already plans for.
- A `number` setting outside its `min`/`max` is rejected at load - Unclear; if wrong: it may be clamped or treated as unset, so a bad value falls back to the default instead of stopping the mod.
- The module variable survives a `/clear` - Unclear; if it does and the first reading after the clear is still above the first point, reminders stay held until the fill passes the old next point.
- `hooks/hooks.json` can point at `../src/` - Unclear; if wrong: the build needs a thin entry module in `hooks/` or a change to the coverage policy's `src/**`.
- `node --test` on Node 26.13.1 skips `*.test.ts` files - Unclear; if wrong: it picks up the `claude plugin test` files, their `claude-code/testing` import fails, and those files need names `node --test` skips.
