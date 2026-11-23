---
status: testing
phase: 1
fields_version: 1
started: 2026-11-23
updated: 2026-11-23
---

## Items

### 1. Default timing toasts at 33% and 43%
expected: With the default settings, readings of 32%, 33%, 40%, 42% and 43% give one toast naming /clear with timeoutMs 15000 at 33%, none at 40% or 42%, and the next at 43%.
criterion: AC1
status: pass
first_pass: pass
source: verifier
evidence: test/headroom.test.mjs:52 'default settings: toasts at 33 and then 10 points later, 15 s, naming /clear' passes; test/headroom.plugin.test.tsx:25 'the manifest defaults reach the mod' passes through the engine with timeoutMs [15000, 15000]; src/headroom.mjs:9-13; manifest defaults .claude-plugin/plugin.json:9,17,25.

### 2. A jump from 20% to 60% toasts once
expected: With the default settings, a reading of 60% right after 20% shows exactly one toast, readings of 61% to 69% show none, and 70% shows the next.
criterion: AC2
status: pass
first_pass: pass
source: verifier
evidence: test/headroom.test.mjs:63 passes; spot-check over 20,60,61..69,70 toasts only at 60 (once) and 70; src/headroom.mjs:13 moves the next point to the reading plus the step.

### 3. Reminders start over below the first point
expected: After a toast at 43%, a reading of 10% and then 33% shows a toast at 33%, and a missing reading in between shows no toast and leaves the next point where it was.
criterion: AC3
status: pass
first_pass: pass
source: verifier
evidence: test/headroom.test.mjs:82 (33,43,10,missing,33 -> 33,43,33) and :76 (a missing reading does not reset) pass; src/headroom.mjs:8 and :14-16.

### 4. The options change the timing and duration
expected: With first point 20, step 5 and toast seconds 30, a reading of 20% shows a toast with timeoutMs 30000, and the next one shows at 25%.
criterion: AC4
status: pass
first_pass: pass
source: verifier
evidence: test/headroom.test.mjs:69 passes; test/headroom.plugin.test.tsx:35 passes through the engine with { options: 20/5/30 } read as settings: timeoutMs 30000 at 20, none at 21 and 24, the next at 25.

### 5. Plugin validates with one hook and one $ call
expected: claude plugin validate /code/headroom passes and lists session.measure as the only event hooked and $.ui.toast as the only $ call.
criterion: AC5
status: pass
first_pass: pass
source: verifier
evidence: claude plugin validate /code/headroom exit 0, 'Validation passed with warnings' (version, author), hooks: session.measure, calls: $.ui.toast, nothing else; test/headroom.plugin.test.tsx:48 shows no session rows appended.

### 6. Coverage gate and plugin tests pass
expected: The coverage commands in .github/cadence/coverage-policy.json pass (85% of lines and branches on src/**), and claude plugin test /code/headroom exits 0.
criterion: AC6
status: pass
first_pass: pass
source: verifier
evidence: Dispatched suite command on Node v26.13.1: 6/6 pass, exit 0, src/headroom.mjs 100% lines and branches, both lcov guards exit 0; .github/workflows/test.yml:19-23 carries the policy commands; claude plugin test /code/headroom: 3 pass, exit 0.

### 7. Live session toasts with no transcript line
expected: In a session started with claude --plugin-dir /code/headroom, a toast suggesting /clear shows once the fill reaches the first point, and the transcript gets no line from the mod. (human-verify: needs a live Claude Code session)
criterion: AC7
status: skipped
first_pass: fail
source: model
evidence: .planning/phases/1/CONTEXT.md AC7 and PLAN.md Task 3 Verify mark it human-verify; SUMMARY.md Open items leave it to John. .github/workflows/test.yml:19 runs node --test over fakes (test/headroom.test.mjs:11-28). test/headroom.plugin.test.tsx:4-16 stands its own session.measure and ui.toast hooks in for the engine and raises the event itself (:18-23); reference.md:130 says the kit checks hooks, not paint. Nothing loads /code/headroom through claude --plugin-dir and has the engine's own session.measure, from a real turn, cross the first point.
reported: behavior wrong - no automated check exercises it: under the active testing policy a required acceptance criterion needs one, and AC7 was planned as human-verify only
severity: major
cause: AC7 was planned as human-verify only, and under the active testing policy a required criterion needs an automated check that a person cannot stand in for. No automated check runs a real turn: test/headroom.plugin.test.tsx:4-16 supplies its own session.measure and ui.toast hooks in place of the engine, which is how claude plugin test works (plugin-authoring reference.md:130), and the CI job test (.github/workflows/test.yml:19) runs node --test over fakes. A real-turn check needs a model call with credentials CI does not hold. The code itself shows no defect: the engine path (manifest defaults, the toast event, no session rows) passes in claude plugin test.
reason: John chose "Make it optional (Recommended)" in /cad-verify 1. That option's stated reason: claude plugin test already covers the engine path, and no code change can automate a real model turn.

## Summary

total: 7
passed: 6
failed: 0
pending: 0
skipped: 1
blocked: 0
reworked: 1
