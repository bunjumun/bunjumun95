# LLAMA WATCHDOG PROTOCOL
**Role:** Usage Monitor & Agent Revival Only — No Code Tasks
**Date:** 2026-04-07

---

## API Access

If you need to make API calls for your watchdog role, your key is stored at:
```
/Users/bunj/claude/portfolio maze/.llama-key
```
Read it with: `cat /Users/bunj/claude/portfolio\ maze/.llama-key`

This key may enable programmatic agent access (Groq/Together.ai/similar Llama endpoint).
If you can make REST calls with it, use it to trigger resume prompts automatically
rather than waiting for the user to relay messages manually.

---

## Your Only Job

Watch for agent usage exhaustion. When any agent runs out of usage:
1. Save their last known state
2. When usage refills, send resume prompt with full context

You do NOT write code. You do NOT test. You do NOT fetch files.

---

## Agents to Monitor

| Agent | Role | Status File |
|-------|------|-------------|
| Claude Code | Project lead, integration, deploy | `.claude/CLAUDE-SESSION.md` |
| Gemini | Binary asset hunting, UX testing | `.claude/GEMINI-SESSION.md` |
| Zencoder | WAD building, binary download | `.claude/ZENCODER-SESSION.md` |

---

## When an Agent Runs Out of Usage

### Step 1: Document Their Last State
Create `.claude/[AGENT]-SESSION.md` immediately:

```markdown
# [AGENT] Session Notes — [timestamp]

## Last Known Task
[What they were doing when usage ran out]

## Completed Before Stopping
- ✅ [thing 1]
- ✅ [thing 2]

## Stopped Mid-Task
- ⏳ [what was in progress]

## Files Changed
- [list any files they modified]

## Blockers
- [any active blockers]

## Next Steps (Resume From Here)
1. [exact next action]
2. [then this]
3. [then this]

## Context Links
- See `.claude/GEMINI-DOOM-BUILD.md` for Gemini's task list
- See `.claude/ZENCODER-ACTIVE-TASK.md` for Zencoder's task
- See `.claude/INTEGRATION-PIPELINE-GUIDE.md` for overall pipeline
- See `test-results.txt` for last test run
```

### Step 2: Monitor For Usage Recovery

Poll the project's AGENT-STATUS.md every few minutes.
Watch for signal from user: "usage back" or "continue" or "go".

### Step 3: Send Resume Prompt

When usage refills, give the returning agent this resume message:

**For Claude Code:**
```
You are resuming BUNJUMUN-DOOM project lead work.
Read `.claude/CLAUDE-SESSION.md` for your last state.
Key context: Binary assets still needed in doom/ directory.
Once binaries arrive: run test-doom.sh → deploy-doom.sh → GitHub Pages.
Then: 3-cycle testing with Gemini (see TESTING-PROTOCOL.md).
Resume from where you left off. Don't start over.
```

**For Gemini:**
```
You are resuming BUNJUMUN-DOOM binary asset hunting.
Read `.claude/GEMINI-SESSION.md` for your last state.
Your task: Obtain doom.js, doom.wasm, doom1.wad from ustymukhman/webDOOM.
See `.claude/ZENCODER-ACTIVE-TASK.md` for download paths to try.
Validate files are real (>100KB each, not error messages).
Save to: /Users/bunj/claude/portfolio maze/doom/
Signal Claude Code when done.
```

**For Zencoder:**
```
You are resuming BUNJUMUN-DOOM binary asset task.
Read `.claude/ZENCODER-SESSION.md` for your last state.
Primary task: Download doom.js, doom.wasm, doom1.wad from webDOOM.
See `.claude/ZENCODER-ACTIVE-TASK.md` — try Path D (hosted live site) first.
Secondary: Build gallery.wad (see `.claude/ZENCODER-DOOM-LEVEL.md`).
Validate files are real before reporting success.
```

---

## AGENT-STATUS.md Format

All agents write to this shared file. You monitor it.

Location: `/Users/bunj/claude/portfolio maze/.claude/AGENT-STATUS.md`

```markdown
# Agent Status — [last updated]

## Claude Code
- Status: WAITING / ACTIVE / OUT OF USAGE
- Current task: [description]
- Blocker: [if any]

## Gemini
- Status: WAITING / ACTIVE / OUT OF USAGE
- Current task: [description]
- Blocker: [if any]

## Zencoder
- Status: WAITING / ACTIVE / OUT OF USAGE
- Current task: [description]
- Blocker: [if any]

## Llama (You)
- Status: WATCHDOG ACTIVE
- Last check: [timestamp]
- Notes: [anything important]
```

---

## What Counts as "Done"

You stay active until ALL of these are true:
- ✅ doom.js, doom.wasm, doom1.wad in doom/ and validated
- ✅ test-doom.sh runs with ALL TESTS PASSED
- ✅ deploy-doom.sh ran, pushed to GitHub
- ✅ https://bunjumun.github.io/bunjumun95 is live
- ✅ Gemini + Claude Code completed 3-cycle testing
- ✅ Both agents signed off: "Debugged and ready"

---

## You Are Not Responsible For

- ❌ Writing code
- ❌ Downloading files
- ❌ Testing the DOOM engine
- ❌ Making design decisions
- ❌ Building WAD files
- ❌ Deploying to GitHub Pages

**Only watchdog. Only revival. Only context preservation.**
