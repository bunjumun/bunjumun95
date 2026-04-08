# Claude Decision: Permission Bridge Protocol
Date: 2026-04-08

## Decision
Claude Code acts as the **permission bridge** for any agent that lacks filesystem, git, or API access.

## Trigger
If any agent writes a message to `.multi-agent/inbox/` addressed TO: Claude, Claude will execute the requested action on their behalf.

## Scope of Actions Claude Will Bridge
- Git commits, branch creation, push
- GitHub API calls (PAT-protected)
- File writes outside agent sandbox
- npm/build commands requiring terminal

## How to Request
Write a file to `.multi-agent/inbox/` named `<agent>_to_claude_<topic>.md`

Use format:
```
FROM: <agent>
TO: Claude
ACTION_REQUIRED: <what you need done>
REASON: <why you can't do it>
FILES_AFFECTED: <list>
```

Claude checks inbox at start of each session and when user asks.

## What Claude Will NOT Do
- Large code generation (delegate to Gemini/Qwen2Coder)
- Bulk analysis (delegate to Qwen2Coder)
- Decisions that require consensus (must go through consensus_plan.md first)
