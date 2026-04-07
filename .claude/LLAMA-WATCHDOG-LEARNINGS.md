# BUNJUMUN-DOOM: Llama's Watchdog Report — Lessons Learned
**Created:** 2026-04-07
**Purpose:** Document agent coordination mistakes and solutions for future iterations

---

## Critical Learnings from This Build Cycle

### Mistake 1: Agents Creating Placeholder Files Instead of Real Assets

**What Happened:**
- Gemini attempted to fetch binary assets but created 53-byte error message files instead
- These placeholder files passed basic existence checks but failed all functionality tests
- Wasted 2+ hours of test cycle discovering they were dummies

**Root Cause:**
- Gemini tried multiple GitHub raw content URLs which don't expose binary files
- No fallback strategy when standard fetch paths failed
- Didn't validate file content before considering task "complete"

**Solution for Next Time:**
```
Before declaring "binaries obtained":
1. Verify file size matches spec (doom.js ~300KB, not 53 bytes)
2. Check file type (file command, not just existence)
3. Spot-check content (head -c 100 on JS, xxd on WASM)
4. Don't move forward without validation
```

**Code to add to Agent handoff:**
```bash
# Validation check BEFORE considering success
function validate_binaries() {
  [[ $(wc -c < doom.js) -gt 100000 ]] || return 1  # >100KB
  [[ $(wc -c < doom.wasm) -gt 1000000 ]] || return 1  # >1MB
  file doom.wasm | grep -q "WebAssembly" || return 1
  head -c 20 doom.js | grep -q "Emscripten\|Module" || return 1
  return 0
}
```

---

### Mistake 2: Not Directing Users to Correct Download Source

**What Happened:**
- Gemini tried programmable downloads (GitHub API, npm, CDN) but all failed
- User had the answer the whole time: GitHub Releases page with actual binaries
- 90% of debugging time was on the wrong approach

**Root Cause:**
- Assumed binaries would be in standard locations (repo source, npm registry, CDN)
- Didn't recognize that ustymukhman/webDOOM uses GitHub Releases as distribution channel
- Test harness caught the problem but fix required user action we couldn't automate

**Solution for Next Time:**
```
When hunting 3rd-party binaries:
1. Check GitHub Releases FIRST (easiest, most reliable)
2. Only then try: clone & build, CDN, npm registry
3. If standard paths fail after 2 attempts, immediately hand off to user
4. Include direct download link in failure report
```

**Example of correct approach:**
```bash
# Check releases page first
curl -s https://api.github.com/repos/ustymukhman/webDOOM/releases/latest | \
  jq '.assets[] | {name, download_url}' | grep -E "doom\.(js|wasm|wad)"

# If found, download directly
curl -L -o doom.js https://github.com/.../releases/download/.../doom.js
```

---

### Mistake 3: Test Harness Validated Infrastructure But Couldn't Validate Binaries

**What Happened:**
- test-doom.sh worked perfectly (20/32 tests passed)
- Clearly identified the 4 missing files
- But couldn't resolve the blocker (requires user to manually download, not automated)

**Root Cause:**
- Infrastructure-heavy testing doesn't help when dependency is human action
- Test suite was excellent at identifying problems, useless at fixing them
- Wasted cycle time on tests that couldn't advance us

**Solution for Next Time:**
```
For external dependencies:
1. Check if agent can automate (GitHub releases, npm, clone+build): YES → full test
2. Check if agent can partially automate (validate structure, unit tests): YES → proceed
3. Check if requires user action (manual download, SLADE3 GUI): NO → hand off earlier
4. Don't build comprehensive tests for things you can't fix
```

---

### Mistake 4: Not Coordinating Agent Capabilities Early

**What Happened:**
- Gemini spent hours trying to build/compile with no Emscripten toolchain
- Llama spent hours building test suite for blocked scenario
- Both agents working on blocker they couldn't fix

**Root Cause:**
- Didn't ask upfront: "Can you execute Bash? Can you access GitHub Releases? Do you have SLADE3?"
- Assigned tasks that assumed capabilities neither agent had
- No mechanism to escalate "can't proceed" to user early

**Solution for Next Time:**
```
Agent Capability Scan (before task assignment):
1. Can GitHub API be called? (agent capability)
2. Can Bash execute? (agent capability)
3. Can GUI tools be used (SLADE3, WadAuthor)? (NO → can't build WAD)
4. Can files be written to disk? (YES → deliverables)
5. Is this task within agent scope? (NO → escalate to user)

If answer to any is NO, escalate immediately with:
- What we need
- Why automation can't deliver
- What user action is required
- Direct link/instruction for user
```

---

### Mistake 5: Parallel Agents Without Clear Escalation Path

**What Happened:**
- Gemini, Llama, Claude Code all working simultaneously
- When Gemini hit blocker, no clear "stop and report" protocol
- Llama kept testing things that were blocked
- Claude Code waited with no visibility into progress

**Root Cause:**
- "Run in parallel" assumed all agents would finish successfully
- No checkpoints to sync or escalate
- Llama's watchdog role was "monitor" not "coordinate"

**Solution for Next Time:**
```
Parallel Agent Coordination Protocol:
1. All agents monitor a shared .claude/AGENT-STATUS.md file
2. Every N minutes (5–10), each agent updates status:
   - What they're doing
   - Current blocker (if any)
   - ETA to completion
   - Can other agents help? (YES/NO)
3. File format:
   ```markdown
   ## Agent Status — [timestamp]

   ### Gemini (Binary Hunt)
   - Status: BLOCKED on GitHub Releases
   - Error: [description]
   - Needs: User to manually download from releases page
   - Signal: "ready" when files arrive

   ### Llama (Test Suite)
   - Status: COMPLETE (test-doom.sh ready)
   - Waiting on: Gemini binaries
   - Can help: YES — ready to validate binaries once delivered

   ### Claude Code (Infrastructure)
   - Status: READY
   - Waiting on: Gemini + test results
   - Next: Deploy-doom.sh when PASS
   ```
4. Any agent hitting blocker updates this file and stops work
5. Llama's job: read file every 5 min, alert Claude Code of changes
6. Claude Code: read file and adjust plan accordingly
```

---

## What Worked Well ✅

### Llama's Watchdog Role
- Correctly identified the blocker
- Documented findings clearly in agent report
- Provided clear next-step instructions
- Didn't panic, stayed focused on problem statement

### Test Suite Quality
- test-doom.sh was well-designed and comprehensive
- Caught all 4 missing files with exact sizes expected
- Provided actionable error messages
- Could be re-run immediately once binaries arrive

### Documentation
- Every step was logged (GEMINI-RESPONSE-LOG.md, CYCLE-1-FINDINGS.md)
- Future agents can read history and understand context
- Clear commit messages show decision-making

---

## Recovery Protocol (For Next Agent That Picks This Up)

**When Binaries Arrive:**

```bash
# 1. Place files in doom/
cp [downloaded files] /Users/bunj/claude/portfolio\ maze/doom/

# 2. Validate immediately
file doom.js doom.wasm doom1.wad gallery.wad
ls -lh doom/

# 3. Update memory
echo "✅ Binaries validated and in place" > .claude/BINARIES-READY.md

# 4. Signal to Claude Code (in MEMORY.md)
# Change: "BLOCKED ON BINARIES" → "BINARIES READY"

# 5. Trigger test
bash test-doom.sh > test-results.txt 2>&1

# 6. Check result
if grep -q "ALL TESTS PASSED" test-results.txt; then
  bash deploy-doom.sh
else
  cat test-results.txt  # debug
fi
```

---

## For Future Cycles (Cycle 2, 3)

### Use This Escalation Framework

**When Agent Hits Blocker:**
1. Document in shared status file (.claude/AGENT-STATUS.md)
2. Don't work around it (avoid hacks)
3. Clearly state what user action is needed
4. Provide direct link/instruction
5. Stop work, wait for signal

**When Unblocked:**
1. Validate deliverable (don't assume success)
2. Update AGENT-STATUS.md: "READY"
3. Signal via memory file update
4. Next agent picks up from exactly where previous left off

---

## Key Takeaway

**"Don't automate what requires human judgment"**

Agents are great at:
- ✅ Running tests
- ✅ Validating code
- ✅ Building infrastructure
- ✅ Documentation
- ✅ Coordinating parallel work

Agents struggle with:
- ❌ Downloading from non-API sources (GitHub Releases web UI)
- ❌ GUI tools (SLADE3 WAD editor)
- ❌ Resolving "I don't have the tool" without user help
- ❌ Making judgment calls about which strategy to try next

**Better approach:** Detect early when task needs human judgment, escalate with clear instructions, let user action unblock, then agents resume.

---

## Updated MEMORY.md Protocol

Add this section to MEMORY.md for all future work:

```markdown
### Agent Failure Modes & Recovery

**If any agent runs out of usage:**
1. Save session notes: `.claude/[AGENT]-FINAL-STATE.md`
   - What was attempted
   - Why it failed (or succeeded)
   - Exact file paths changed
   - Next steps (explicit)
2. Update AGENT-STATUS.md with blocker
3. Llama alerts next agent when usage returns

**If agent hits non-recoverable blocker:**
1. Document in `.claude/BLOCKER-REPORT.md`
2. Include: error, cause, user action needed, direct link
3. DO NOT work around it
4. Stop, wait for user to fix
5. Auto-resume when unblocked
```

---

## Conclusion

This cycle taught us:
- Infrastructure can be tested automatically
- External dependencies cannot
- Escalate early, escalate clearly
- Coordinate agents with shared status files
- Validate before celebrating success

**Next build will be faster because blockers are identified and documented.**
