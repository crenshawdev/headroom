# Context threshold reminder mod

## What This Is

### Problem

- The context fills up during a session, and the user can miss the point where a `/clear` would help. [ASSUMPTION]
- The default toast lasts only 4 seconds, which is easy to miss.

### Solution

- A mod reminds the user to clear when the context reaches a threshold.
- Its hook listens to `session.measure`, which fires whenever the context fill changes.
- The hook checks `e.context.percent` against a threshold and shows a toast suggesting `/clear`.
- The user sets the point of the first reminder.
- The default threshold is 33%, since a task that goes past it is too large.
- The toast stays up longer than the default, so it isn't missed.
- The toast stays up for 15 seconds.
- After the first reminder, it reminds again only when the fill has risen by a set percentage.
- The set increase is 10 points, so after a first reminder at 33% the next ones come at 43%, 53% and so on.
- After a `/clear` drops the fill below the threshold, the reminders start over. [ASSUMPTION]

### Who it serves

- The person running the session, who decides when to clear.

### What's different

- The reminder costs no tokens, because the toast leaves the transcript and the model untouched.
- It only reminds, and never acts for the user.

## Core Value

When the context fill reaches the point the user set, a toast suggests a `/clear` and stays up long enough to be seen, without adding anything to the transcript or spending tokens.

## Requirements

### Validated

(None yet - ship to validate)

### Active

No cycle open.

The last cycle, the milestone "Context threshold reminder mod", closed on 2026-11-22.

- Requirements: REM-01, REM-02, REM-03, REM-04 and NFR-01, all Complete.
- Phases and commits: 1 phase (Context reminders), and 11 commits on `phase-1-context-reminders` ahead of `master`, through `40b15a1`.
- Audit: PASS. All 5 requirements trace to a phase, a plan and a verified checklist, and all 7 acceptance criteria reached a UAT item. AC7, the live-session check, was skipped as optional because no automated check can run a real model turn.
- Manifest version: 0.1.0 in `.claude-plugin/plugin.json`, set after the close. Nothing has been tagged.
- Where it lives now: the requirement rows are in REQUIREMENTS.md's `## Shipped`, the phase's documents are in `.planning/_archive-Context threshold reminder mod/1/`, and the residue is in `.planning/records/ARCHIVE.md`.
- Still outstanding: the merge into `master` is `/cad-land`'s. Nothing has been pushed, so CI hasn't run on this work.

### Out of Scope

- It won't run `/clear` itself, because the user decides when to clear.
- It won't nag, because the user decides when to clear.

## Context

### Success criteria

- When the fill crosses the threshold, a toast suggesting `/clear` shows and stays up long enough to be seen. [ASSUMPTION]
- A reminder adds nothing to the transcript and spends no tokens.
- No reminder repeats until the fill has risen by the set increase. [ASSUMPTION]

### Scope

- One mod with one hook on `session.measure` that shows a toast. [ASSUMPTION]
- The threshold, the set increase and how long the toast stays up are settings the user can change. [ASSUMPTION]

### Vision

- The user sees the context filling up without spending tokens on it, and clears at a moment of their own choosing. [ASSUMPTION]

## Constraints

- **stack**: The mod is one JavaScript module - The mod is written in plain JavaScript, as one ES module that Claude Code loads. [ASSUMPTION]
- **hosting**: It runs as a Claude Code mod in the user's own session - The reminder runs inside the user's Claude Code session on their own machine, as a mod, with no server or outside service.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|

---
*Last updated: 2026-11-22 after closing the milestone "Context threshold reminder mod"*
