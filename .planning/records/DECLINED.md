# Declined: findings this repository said no to

Written by `issue-filing.mjs file` when a gate's finding is DECLINED, read by
`issue-filing.mjs unfixed` as the set it must never ask about again. Same row
grammar as FILED.md: the date, the provider, the repository slug, the finding's
(file, claim) fingerprint and its title.

NOT part of the recall corpus and not a queue. `planning.mjs recall` reads
CAPTURE.md, ARCHIVE.md, the task records and FILED.md by explicit path, and
this file is deliberately absent from that list - a decline is a closed
question, and putting closed questions in front of a planner is the
accumulation the corpus rules exist to prevent. Query it, do not load it.

A line that is not a row is skipped, so a human note added here changes nothing
the seam reads.

- 2026-11-23 github crenshawdev/headroom 0dbcc59ba7871623: [cadence 0dbcc59ba7871623] Task 2's Verify expects `claude plugin validate` to list the three `userConfig` fields, but validate in 2.1.330 never lists userConfig fields, so this part of the Verify can
