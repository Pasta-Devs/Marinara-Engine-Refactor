# Durable Notes Workflow Card

Use this when a session produces durable repo memory.

## Classify Exactly One

- No durable note
- Bug ownership/status update
- Architecture decision
- Reusable debugging lesson
- Cross-issue or cross-PR task note

Default to no durable note for one-off bugs, routine issue filing, tiny PRs, and anything already fully represented in GitHub or the final response.

## Capture When

- A bug changes owner or status under `updates/`.
- A team decision was made or confirmed.
- A reusable debugging lesson was learned.
- An architecture behavior was clarified.
- Work spans more than one issue, PR, or session.

## Where To Put It

- Use `updates/unowned-bugs.md` for unowned bug reports.
- Use `updates/people/*.md` for active bug ownership and status per `AGENTS.md`.
- Use repo docs or skill references only when the decision changes durable architecture or agent guidance.

Do not store secrets, private user data, bulky raw logs, or machine-local paths in durable repo files.
