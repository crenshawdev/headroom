# Headroom

[![Test](https://github.com/crenshawdev/headroom/actions/workflows/test.yml/badge.svg)](https://github.com/crenshawdev/headroom/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/github/license/crenshawdev/headroom)](LICENSE)

Headroom is a Claude Code mod that reminds you to `/clear` when your session's context fills past a point you choose.

A long session fills the context a little at a time, and it's easy to miss the moment a `/clear` would help. Claude Code's own toasts stay up for 4 seconds, which is easy to miss too. Headroom checks the fill after each turn. When it reaches the first reminder point, 33% unless you set another, a toast suggests a `/clear` and stays up for 15 seconds. You get the next reminder only after the fill rises another 10 points.

The toast stays out of the transcript and never reaches the model, so a reminder costs no tokens. Headroom never runs `/clear` for you. When to clear is your call.

## Install

Headroom is listed in the Foundation marketplace, beside Cadence and burnrate. At the prompt of a Claude Code terminal session:

```text
/plugin marketplace add crenshawdev/foundation
/plugin install headroom@foundation
```

This repository is also its own marketplace, if you'd rather install straight from it:

```text
/plugin marketplace add crenshawdev/headroom
/plugin install headroom@headroom
```

Install it from one of the two, not both. Pick a scope when the install asks. Headroom runs in that session right away, and at the user scope it loads in every session you start after. The install also shows a screen where you can set the options below.

In the desktop app, click + next to the prompt box, then Plugins, add the marketplace `crenshawdev/foundation`, then add the plugin.

## How the reminders work

- The first toast shows when a reading reaches the first point: "Context is 33% full. Consider /clear to start fresh."
- The next point is the fill at that reminder plus the step. A jump from 33% to 60% gives one toast at 60%, and the next comes at 70%.
- A reading below the first point, as after a `/clear`, starts the reminders over.
- A turn with no context reading shows nothing and moves nothing.

## Settings

Change these in `/config`.

| Setting | Key | Default | Range |
|---|---|---|---|
| First reminder point, in percent | `firstPoint` | 33 | 1 to 100 |
| Step between reminders, in points | `step` | 10 | 1 to 100 |
| How long a toast stays up, in seconds | `toastSeconds` | 15 | 1 to 300 |

## Limits

- Reminders come only after a turn. Claude Code reports the fill after each turn and reports nothing at the moment of a `/clear`, so the reminders start over on the reading after your next turn.
- The next reminder point lives in memory. Nothing is saved between sessions, and a settings change reloads the mod and starts again from the first point.
- If you set the first point below the fill a fresh context already starts at, a `/clear` never drops the reading below it, so the reminders don't start over.

## Development

Headroom is built and tested against Claude Code 2.1.330. The coverage gate needs Node 26.7 or later, and CI runs 26.13.1.

To run it from a clone for one session:

```text
claude --plugin-dir /path/to/headroom
```

To run the tests:

```text
node --test
claude plugin test
```

`node --test` runs the unit suite, and the `test` job in CI runs it with an 85% line and branch coverage gate on `src/`. `claude plugin test` drives the mod through Claude Code's own test kit and runs locally only.

## License

Headroom is maintained by John Crenshaw and distributed under the [MIT License](LICENSE).
