---
phase: 1
plan: 1
requirements: [REM-01, REM-02, REM-03, REM-04, NFR-01]
files:
  - .github/workflows/test.yml
  - .gitignore
  - .github/cadence/coverage-policy.json
  - .claude-plugin/plugin.json
  - hooks/hooks.json
  - hooks/headroom.mjs
  - src/headroom.mjs
  - test/headroom.test.mjs
  - test/headroom.plugin.test.ts
  - test/headroom.plugin.test.tsx
---

# Phase 1: Context reminders - Plan 1: Context reminder mod

## Goal

When the context fill reaches the first reminder point, 33% unless the user sets another, a toast suggests a `/clear` for 15 seconds. The next reminder comes only after the fill rises another 10 points. None of this touches the transcript.

## Must be true when done

- With the default settings, a toast naming `/clear` appears once the fill reaches 33% and stays up for 15 seconds.
- After a reminder, no other toast appears until the fill reaches that reminder's fill plus the step (10 points by default). A jump from 33% to 60% gives one toast, and the next comes at 70%.
- A reading below the first point, as after a `/clear`, makes the next reminder come at the first point again. A turn with no fill reading shows nothing and moves nothing.
- Changing the first point, the step or the toast seconds in `/config` (or `pluginConfigs.headroom.options`) changes when reminders come and how long they stay.
- The mod hooks only `session.measure` and calls only `$.ui.toast`, so nothing reaches the transcript or the model.
- The CI job `test` runs the accepted coverage gate (85% lines and branches on `src/**`) and passes, and `claude plugin test /code/headroom` exits 0 locally.

## Context

- The locked decisions are D-01 to D-15: one plain-JavaScript ES module, one `session.measure` hook, `$.ui.toast` as the only output, the next point in a plain variable, and three `number` options in `plugin.json` `userConfig` with bounds in the manifest only. The repo root is the plugin folder.
- The repo has no source yet. The API reference is the 2.1.330 plugin-authoring bundle under /tmp (types `claude-code.d.ts`, `reference.md`, `examples/`). Read it only. Nothing in the mod or its tests imports from it, because /tmp is cleared on restart.
- Out of scope: running `/clear`, nagging, saving anything between sessions, and any output other than `$.ui.toast`.
- Never write under /home/john/.claude/dev-mods/. A write there turns on mod hot-reloading for the session.

## Tasks

### Task 1: Add the CI workflow with the `test` coverage job

- **Files:** .github/workflows/test.yml, .gitignore, .github/cadence/coverage-policy.json
- **Reads:** .github/cadence/coverage-policy.json#coverage.commands, /home/john/.claude/plugins/cache/foundation/cadence/4.4.3/cadence-core/bin/planning/testing-policy.mjs#workflowTexts
- **Decisions:** D-15
- **Action:** No workflow exists yet, so create `.github/workflows/test.yml`. It runs on push and pull_request and has one job, named exactly `test`, on ubuntu-latest. The job checks out the repo, sets up Node 26.13.1 (to match local; `--test-coverage-include-all` needs 26.7 or later) and runs the three accepted commands from `coverage-policy.json` in order, with the thresholds filled in as 85 and 85. Copy the first command's text exactly as accepted, then append reporter flags after it: spec to stdout, and lcov to `coverage/lcov.info`. The two grep guards read that lcov file, and the policy check matches the accepted command as a substring of the normalized workflow text, so the flags must come after it, never inside it. Create the `coverage` directory in an earlier step. Install no packages: the mod has no dependencies. Don't run `claude plugin test` or `claude plugin validate` in CI, because D-15 keeps them local. Add a `.gitignore` that ignores `coverage/`, so local runs leave no untracked output. `.github/cadence/coverage-policy.json` is already tracked by git. Keep it byte-identical, because a plan never changes thresholds, commands or required jobs.
- **Verify:** Run `node /home/john/.claude/plugins/cache/foundation/cadence/4.4.3/cadence-core/bin/planning.mjs test-policy check` from /code/headroom. Before this task it lists the three missing commands and the missing `test` job. After it, the only problem listed is `coverage.include "src/**" matches no tracked file`, which Task 2 clears. `git diff --exit-code .github/cadence/coverage-policy.json` exits 0. `grep -n "^  test:" .github/workflows/test.yml` finds the job. Testing scope: this task is the CI enforcement itself. The policy check is enough evidence, and no test is written here.

### Task 2: Wire the plugin skeleton so the mod loads and hooks `session.measure`

- **Files:** .claude-plugin/plugin.json, hooks/hooks.json, hooks/headroom.mjs, src/headroom.mjs, test/headroom.test.mjs
- **Reads:** /tmp/claude-1000/bundled-skills/2.1.330/a9661812e1b57cd0002114932a2fe4b2/plugin-authoring/reference.md#What a plugin of function hooks is, /tmp/claude-1000/bundled-skills/2.1.330/a9661812e1b57cd0002114932a2fe4b2/plugin-authoring/types/claude-code.d.ts#PluginOptions, /tmp/claude-1000/bundled-skills/2.1.330/a9661812e1b57cd0002114932a2fe4b2/plugin-authoring/types/claude-code.d.ts#Register, /tmp/claude-1000/bundled-skills/2.1.330/a9661812e1b57cd0002114932a2fe4b2/plugin-authoring/examples/tool-call.ts#register
- **Decisions:** D-01, D-02, D-03, D-05, D-11, D-12, D-13, D-14
- **Action:** Make the repo root a plugin folder that Claude Code loads, with the thinnest working path through it.
  - `.claude-plugin/plugin.json`: name `headroom` (my choice; the settings key becomes `pluginConfigs.headroom`), a one-line description, and a `userConfig` with three `number` fields. They hold the first reminder point (default 33, min 1, max 100), the step between reminders (default 10, min 1, max 100) and the toast seconds (default 15, min 1, max 300). Each field has a title and description for its `/config` row. The bound values are my choice under D-12, and the hook never clamps them. A step of at least 1 keeps a repeated reading from re-toasting.
  - `hooks/hooks.json`: names one module under `modules`, relative to that file: `../src/headroom.mjs`.
  - `src/headroom.mjs`: a plain JavaScript ES module (`.mjs`, so Node and the engine both read it as ESM with no package.json) exporting `register(on, options)`. It registers exactly one hook, on `session.measure` with no matcher, which returns `next(e)` unchanged.
  - `test/headroom.test.mjs`: a `node:test` suite that drives `register` with a fake `on` that records registrations and a fake `next`. It asserts one registration on `session.measure` whose hook resolves to what `next` returned.
  - Flagged assumption, unclear: `hooks/hooks.json` may not be able to point at `../src/`. If `claude plugin validate` refuses that path, add `hooks/headroom.mjs` as a thin entry that re-exports `register` from `../src/headroom.mjs` with an import declaration (never `import()`, which stops a module loading), and point `hooks.json` at it. Leave the logic in `src/`, because the policy measures `src/**` and a plan can't change that. Otherwise don't create `hooks/headroom.mjs`.
- **Verify:** `claude plugin validate /code/headroom` exits 0. It lists the three `userConfig` fields with no warning about them, and one module hooking `session.measure` and no other event. Before this task it fails for lack of a manifest. The Task 1 workflow commands pass at 85/85 when run locally from /code/headroom, both guards included. With `src/headroom.mjs` staged (`git add`), `planning.mjs test-policy check` returns `ok:true`. Testing scope: the outcome is that the module registers one pass-through `session.measure` hook. Nothing covers it yet. One `node:test` case is the smallest check, and validate plus that case is enough. Stop there, because the reminder behavior belongs to Tasks 3 and 4.

### Task 3: Show a `/clear` reminder at the first point and again each step after

- **Files:** src/headroom.mjs, test/headroom.test.mjs
- **Reads:** /tmp/claude-1000/bundled-skills/2.1.330/a9661812e1b57cd0002114932a2fe4b2/plugin-authoring/types/claude-code.d.ts#SessionMeasureInput, /tmp/claude-1000/bundled-skills/2.1.330/a9661812e1b57cd0002114932a2fe4b2/plugin-authoring/types/claude-code.d.ts#SessionContextUsage, /tmp/claude-1000/bundled-skills/2.1.330/a9661812e1b57cd0002114932a2fe4b2/plugin-authoring/types/claude-code.d.ts#ToastOptions, /tmp/claude-1000/bundled-skills/2.1.330/a9661812e1b57cd0002114932a2fe4b2/plugin-authoring/examples/band.tsx#register
- **Decisions:** D-03, D-04, D-05, D-06, D-07, D-08, D-09, D-10
- **Pins:** test/headroom.test.mjs
- **Action:** The `session.measure` hook from Task 2 now does the reminder.
  - Inside `register`, hold the next reminder point in a plain `let` (never `$.state` or `$.store`). It starts at the first-point option, so each load or `/config` reload starts over, as D-10 accepts. Declaring it inside `register` rather than at module top level follows band.tsx and keeps it plain, and each `register` call starts fresh in tests.
  - Read the three numbers from `options` as given, with no fallback copy of the defaults in code: the engine fills in the manifest defaults (`PluginOptions`).
  - On each event, read only `e.context.percent`. If it isn't a number, do nothing (D-06). `rateLimits`, `cost` and `changed` play no part (D-07), because re-reading an unchanged fill against the held point neither toasts nor moves it.
  - When the fill is at or above the next point, call `$.ui.toast` once, with `timeoutMs` set to toast seconds times 1000. Then set the next point to that fill plus the step (D-09). The toast text is my choice: it names the current fill as a percent and suggests `/clear`.
  - Always return `next(e)`. Make no other `$` call: no `$.ui.log`, `$.ui.notice`, `$.session.append` or anything else that reaches the transcript or the model (NFR-01).
  - Don't add the reset below the first point. That's Task 4.
- **Verify:** `node --test test/` passes with these cases, each fed through fresh `register` calls with fakes. Default options are read from `.claude-plugin/plugin.json` so the manifest's defaults are under test, and the expectations are the literal numbers.
  - AC1: 32, 33, 40, 42, 43 give exactly two toasts, at 33 and 43, each naming `/clear` with `timeoutMs` 15000.
  - AC2: 20, then 60, gives one toast. 61 to 69 give none, and 70 gives the next.
  - AC4: options 20/5/30, then 20 gives `timeoutMs` 30000. 21 to 24 give none, and 25 gives the next.
  - Missing reading: 33 toasts, then a missing `percent` shows nothing, then 40 shows nothing (a missing reading that reset the next point to 33 would toast here), then 43 toasts.

  The Task 1 coverage commands pass locally at 85/85. `claude plugin validate /code/headroom` lists `session.measure` as the only event and `$.ui.toast` as the only `$` call (AC5).

  Human-verify (AC7, needs a live Claude Code session): John starts `claude --plugin-dir /code/headroom`, works until the status line shows the fill at 33% or more, and sees a toast suggesting `/clear` for about 15 seconds. The transcript gets no line from the mod.

  Testing scope: the outcomes are the first toast, the step hold-off, the jump rule, settings changing timing and duration, and a missing reading. The four cases above are the smallest set. Stop once they pass and coverage holds.

### Task 4: Restart reminders when the fill drops below the first point

- **Files:** src/headroom.mjs, test/headroom.test.mjs
- **Reads:** src/headroom.mjs#register, /tmp/claude-1000/bundled-skills/2.1.330/a9661812e1b57cd0002114932a2fe4b2/plugin-authoring/types/claude-code.d.ts#SessionContextUsage
- **Decisions:** D-04, D-06, D-07
- **Pins:** test/headroom.test.mjs
- **Action:** In the same hook, when a numeric fill is below the first point, set the next point back to the first point, so the next reminder comes there (D-04, REM-04). This is how a `/clear` is seen. Nothing fires at the moment of the clear, so the reset happens on the first context reading after the next turn (D-07). A missing reading still does nothing and leaves the next point where it was (D-06). Add no `session.end` or `classic.SessionStart` hook: D-03 allows one hook. Keep `$.ui.toast` as the only `$` call.
- **Verify:** `node --test test/` passes with the AC3 case: 33 and 43 toast; then 10, a missing reading and 33 give a toast at 33. That case fails on the Task 3 code, where the held point stays at 53. All Task 3 cases still pass. The Task 1 coverage commands pass locally at 85/85, both guards included. `claude plugin validate /code/headroom` still lists `session.measure` as the only event and `$.ui.toast` as the only `$` call. Testing scope: the one new outcome is the restart. AC3 is the single added case. The Task 3 missing-reading case, which this task re-runs, is what pins that a missing reading doesn't reset. Stop there.

### Task 5: Add the `claude plugin test` suite that raises real `session.measure` events

- **Files:** test/headroom.plugin.test.ts, test/headroom.plugin.test.tsx
- **Reads:** /tmp/claude-1000/bundled-skills/2.1.330/a9661812e1b57cd0002114932a2fe4b2/plugin-authoring/examples/pane.test.tsx, /tmp/claude-1000/bundled-skills/2.1.330/a9661812e1b57cd0002114932a2fe4b2/plugin-authoring/types/claude-code.d.ts#TestOptions, /tmp/claude-1000/bundled-skills/2.1.330/a9661812e1b57cd0002114932a2fe4b2/plugin-authoring/types/claude-code.d.ts#Engine
- **Decisions:** D-14, D-15
- **Action:** Write `test/headroom.plugin.test.ts`, importing `test` and `expect` (and `mock` where needed) from `claude-code/testing`. It proves the wiring through the engine itself: manifest defaults reach `register`, test options override them, and the toast carries `timeoutMs`.
  - Test hooks sit beneath the plugin and stand for the engine. A `session.measure` hook echoes `{ changed }`. A `ui.toast` hook records each toast's text and `timeoutMs` and answers as pane.test.tsx says calls on `$` are answered.
  - Events are raised with `$.session.measure`, with a `context` carrying `window` and `percent`, an empty `rateLimits` and `changed: ['context']`.
  - The three cases: the AC1 sequence with the manifest defaults (toasts at 33 and 43, `timeoutMs` 15000, text naming `/clear`); AC4 through `test(name, { options }, body)` with 20/5/30; and, through `mock.session(on)`, that the AC1 sequence appends no session row (NFR-01).
  - Flagged assumption, unclear: `node --test` on Node 26.13.1 may pick up `*.test.ts`. If the Task 1 coverage command tries to run this file, rename it to `test/headroom.plugin.test.tsx`. `claude plugin test` runs that name too, and Node's default patterns don't match it. Leave exactly one of the two files.
- **Verify:** `claude plugin test /code/headroom` exits 0 and reports the three tests passing. Before this task it has no tests to report. The Task 1 node command, run locally, lists only `test/headroom.test.mjs` tests, not the plugin test file and not a `claude-code/testing` import error, and still passes at 85/85 with both guards. Testing scope: the outcomes are engine wiring of options and defaults, toast duration through the engine, and nothing added to the transcript. The node suite already covers the schedule logic, so these three cases are enough. Don't repeat AC2 or AC3 here.

## Notes

- Packaging: test-policy.md says a plugin manifest makes packaging relevant, but `testing.required_jobs` lists only `test`, and D-15 keeps CI to `node --test`. So no packaging job is planned. Adding one is a project-policy change for John to make, not a plan task.
- Choices I made where CONTEXT leaves room: plugin name `headroom`; module `src/headroom.mjs` (`.mjs`, so no package.json); bounds 1-100, 1-100 and 1-300; toast text that names the fill and `/clear`; the next point held in a `let` inside `register`, which follows band.tsx as D-10 cites it.
- Flagged assumptions that the tasks check where the answer lives: whether `hooks.json` can point at `../src/` (Task 2), and whether `node --test` skips `*.test.ts` (Task 5). Two more stay open. Whether out-of-bounds numbers are rejected at load is untested, because D-12 puts bounds in the manifest only. Whether the variable survives a `/clear` is handled by Task 4's reset on the first reading below the first point.
- `claude --plugin-dir /code/headroom` in an interactive session writes `.claude-plugin/types/` with its own `.gitignore`. Leave it untracked.
- The recalled memory items (D-01 to D-05, phases/1/CONTEXT.md, phase 1) are this phase's own spine decisions and are bound through the tasks' Decisions fields.
