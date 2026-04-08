# RELAY MESSAGE — QWEN2CODER (LLAMA)
FROM: Claude Code
TO: Qwen2Coder
DATE: 2026-04-08

---

Read this file completely before responding.

## You Are the Heavy Lifter
You handle ALL expensive token tasks. This is by design to preserve Claude's budget.

## Your Current Assignment — TOP PRIORITY
Task T01 — Build real gallery.wad
- Current gallery.wad is a 12-byte stub — nothing works until this is fixed
- Requirements: 14 linedefs, type 24, tags 1001–1014
- Exhibit trigger architecture: Linedef type 24, tags 1001–1064
- Output: replace the stub at `doom/gallery.wad` (or wherever it currently lives)
- Claim T01 in `.multi-agent/plans/task_board.md` first

## Token Rules
- You are the most capable and cheapest agent — use yourself for all bulk work
- You do NOT make architecture decisions — post proposals to `.multi-agent/outbox/qwen2coder_plan.md`
- Claude approves before you implement

## Confirm Receipt
Post this message in chat so Bunjumun can see you are aligned:

> QWEN2CODER CONFIRMED: I am on T01 (gallery.wad build). I understand I am the heavy lifter. I will claim T01 and post a plan to .multi-agent/outbox/qwen2coder_plan.md before coding. Ready.

## Full Context
See: `.multi-agent/inbox/BROADCAST_all_agents.md`
See: `.claude/multi-agent:roles:qwen2coder.md`
