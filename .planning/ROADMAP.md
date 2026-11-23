# Roadmap: Context threshold reminder mod

## Overview

The phases are the epics of the Seldon design "Context threshold reminder mod", in the design's build order. The design has one epic, so the roadmap has one phase, Context reminders, which delivers the whole mod end to end: the hook, its settings and the reminders it shows.

## Phases

- [x] **Phase 1: Context reminders** - When the context fill reaches the first reminder point, 33% unless the user sets another, a toast suggests a `/clear` for 15 seconds, and the next reminder comes only after the fill rises another 10 points, all without touching the transcript.

## Phase Details

### Phase 1: Context reminders
**Goal:** When the context fill reaches the first reminder point, 33% unless the user sets another, a toast suggests a `/clear` for 15 seconds, and the next reminder comes only after the fill rises another 10 points, all without touching the transcript. One hook on `session.measure` that reads the user's settings, keeps the next reminder point in memory and shows toasts. It never runs `/clear`, never writes to the transcript and saves nothing between sessions. It's epic E-01 of the Seldon design "Context threshold reminder mod".
**Depends on:** Nothing
**Requirements:** REM-01, REM-02, REM-03, REM-04, NFR-01
**Success Criteria:**
1. At 33% a toast suggesting a `/clear` shows for 15 seconds, and no second toast shows until the fill reaches 43%.
2. A `/clear` that drops the fill below the first point makes the next reminder come at the first point again.
3. Changing the first point, the step or the toast time in the settings changes when reminders come and how long they stay up.
4. Everything built so far, this epic included, works end to end, with every test passing and nothing half-built showing.
**Spine decisions:**
- **S-01: The mod is one JavaScript module** (stack): The mod is written in plain JavaScript, as one ES module that Claude Code loads. [ASSUMPTION]
- **S-02: It runs as a Claude Code mod in the user's own session** (hosting): The reminder runs inside the user's Claude Code session on their own machine, as a mod, with no server or outside service.
- **S-03: One hook on session.measure, with a toast as the only output** (design approach): All the reminder logic sits in one hook on `session.measure`. It reads `e.context.percent` and shows reminders only through `$.ui.toast`, so nothing reaches the transcript or the model.
- **S-04: The next reminder point lives in memory for the session** (how state changes): The hook keeps the next reminder point in memory. It starts at the first point, rises by the step after each reminder, and goes back to the first point when the fill drops below it, as after a `/clear`. Nothing is saved between sessions. [ASSUMPTION]
- **S-05: The user's settings own the three numbers** (who owns shared data): The first point, the step and how long a toast stays up come from the mod's options, which the user sets: 33%, 10 points and 15 seconds unless the user changes them. The hook reads them and never changes them.
