# Archive: the recall residue of closed milestones

Written by `planning.mjs milestone-prune` before it removes a phase directory,
read by `planning.mjs recall` beside CAPTURE.md. One section per closed
milestone, one `- ` row per snippet, each row naming the artifact it came from.
A line that is not a row is skipped, so a note added here mints no recall entry.

## Context threshold reminder mod

- `phases/1/SUMMARY.md`: The live check (AC7) is still John's: run `claude --plugin-dir /code/headroom`, work until the fill reaches 33% or more, and confirm a `/clear` toast stays up about 15 seconds with no transcript line from the mod.
- `phases/1/SUMMARY.md`: `claude plugin validate` does not list the three `userConfig` fields, though it raises no warning about them.
- `phases/1/SUMMARY.md`: The plugin-directory checks (README, LICENSE, icon) fail only under `--profile directory` and were out of this plan's scope.
- `phases/1/SUMMARY.md`: The risk review raised, and its checker refuted against REM-04's wording, a low finding: with the first point set below the fill a fresh window starts at (for example 5% against a 10% baseline), a `/clear` never drops the fill below the first point, so the reminders do not start over (`src/headroom.mjs:14`). REM-04 is marked `[ASSUMPTION]`.
- `phases/1/UAT.md`: Default timing toasts at 33% and 43% With the default settings, readings of 32%, 33%, 40%, 42% and 43% give one toast naming /clear with timeoutMs 15000 at 33%, none at 40% or 42%, and the next at 43%.
- `phases/1/UAT.md`: A jump from 20% to 60% toasts once With the default settings, a reading of 60% right after 20% shows exactly one toast, readings of 61% to 69% show none, and 70% shows the next.
- `phases/1/UAT.md`: Reminders start over below the first point After a toast at 43%, a reading of 10% and then 33% shows a toast at 33%, and a missing reading in between shows no toast and leaves the next point where it was.
- `phases/1/UAT.md`: The options change the timing and duration With first point 20, step 5 and toast seconds 30, a reading of 20% shows a toast with timeoutMs 30000, and the next one shows at 25%.
- `phases/1/UAT.md`: Plugin validates with one hook and one $ call claude plugin validate /code/headroom passes and lists session.measure as the only event hooked and $.ui.toast as the only $ call.
- `phases/1/UAT.md`: Coverage gate and plugin tests pass The coverage commands in .github/cadence/coverage-policy.json pass (85% of lines and branches on src/**), and claude plugin test /code/headroom exits 0.
- `phases/1/UAT.md`: Live session toasts with no transcript line In a session started with claude --plugin-dir /code/headroom, a toast suggesting /clear shows once the fill reaches the first point, and the transcript gets no line from the mod. (human-verify: needs a live Claude Code session)
- `phases/1/CONTEXT.md`: D-01 (stack): The mod is one JavaScript module. The mod is written in plain JavaScript, as one ES module that Claude Code loads. [ASSUMPTION] Evidence: S-01 of the Seldon design "Context threshold reminder mod".
- `phases/1/CONTEXT.md`: D-02 (hosting): It runs as a Claude Code mod in the user's own session. The reminder runs inside the user's Claude Code session on their own machine, as a mod, with no server or outside service. Evidence: S-02 of the Seldon design "Context threshold reminder mod".
- `phases/1/CONTEXT.md`: D-03 (design approach): One hook on session.measure, with a toast as the only output. All the reminder logic sits in one hook on `session.measure`. It reads `e.context.percent` and shows reminders only through `$.ui.toast`, so nothing reaches the transcript or the model. Evidence: S-03 of the Seldon design "Context threshold reminder mod".
- `phases/1/CONTEXT.md`: D-04 (how state changes): The next reminder point lives in memory for the session. The hook keeps the next reminder point in memory. It starts at the first point, rises by the step after each reminder, and goes back to the first point when the fill drops below it, as after a `/clear`. Nothing is saved between sessions. [ASSUMPTION] Evidence: S-04 of the Seldon design "Context threshold reminder mod".
- `phases/1/CONTEXT.md`: D-05 (who owns shared data): The user's settings own the three numbers. The first point, the step and how long a toast stays up come from the mod's options, which the user sets: 33%, 10 points and 15 seconds unless the user changes them. The hook reads them and never changes them. Evidence: S-05 of the Seldon design "Context threshold reminder mod".
