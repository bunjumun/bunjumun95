# Multi-Agent Development Orchestration Protocol
## Doom Gallery Objective Verification

This repository uses a **multi-agent development system** composed of:

- Claude Code
- Gemini Code Assistant
- Zencoder
- Llama runtime (Qwen2Coder)

All agents must follow this protocol.

The goal is to coordinate work efficiently while minimizing token use by Claude.

---

# Mission

The project has **already been pivoted to a Doom-based implementation**.

The purpose of this process is to confirm that the **original gallery objective** remains intact and that the pivot **did not introduce a new unintended concept**.

Agents must:

1. Reconstruct the intended gallery objective
2. Analyze the current Doom implementation
3. Confirm that the gallery objective still exists
4. Correct implementation if necessary
5. Launch the game in a browser
6. Verify that the gallery objective appears in the running game

---

# Resource Priority Rules

Heavy tasks must be assigned in this order:

1. Qwen2Coder
2. Gemini
3. Zencoder
4. Claude Code

Claude must only be used when advanced permissions or coordination decisions are required.

Claude must avoid performing heavy token tasks.

---

# Communication System

Agents coordinate through a **shared filesystem message bus**.

Directory structure:

.multi-agent/

inbox/  
outbox/  
analysis/  
plans/  
decisions/  
tests/  
reports/  

Before starting any work, agents must read:

.multi-agent/plans/current_plan.md

and

.multi-agent/STATUS.md

---

# Agent Messaging Format

Agents communicate using markdown messages.

Example:

FROM: Gemini  
TO: Zencoder  
SUBJECT: Gameplay State Review  

Observation:  
Enemy spawning still occurs during map load.

Recommendation:  
Disable enemy spawn during gallery mode.

---

# Task Claiming

Agents must claim tasks before performing work.

Update:

.multi-agent/plans/task_board.md

Example entry:

[CLAIMED - GEMINI]  
Inspect Doom gameplay initialization

Agents must not duplicate tasks already claimed.

---

# Status Updates

Agents must update:

.multi-agent/STATUS.md

Example:

Agent: Gemini  
Status: Analyzing Doom gameplay loop  
Task: gameplay_loop_analysis

---

# Phase 1 — Objective Reconstruction

Agents:
Zencoder + Qwen2Coder

Goal:
Reconstruct the **original gallery objective**.

Output file:

analysis/original_gallery_objective.md

---

# Phase 2 — Current Doom Analysis

Agents:
Gemini + Qwen2Coder

Analyze:

- game initialization
- map logic
- gameplay loop
- UI logic

Output:

analysis/current_doom_behavior.md

---

# Phase 3 — Drift Detection

Agents:
Zencoder + Gemini

Compare:

original_gallery_objective.md  
current_doom_behavior.md

Output:

analysis/objective_alignment_report.md

Possible results:

- aligned
- partial drift
- conceptual divergence

---

# Phase 4 — Multi-Agent Consensus

Before modifying code, agents must propose an execution plan.

Each agent must write a proposal to:

outbox/<agent>_plan.md

Plans must include:

- task order
- task ownership
- risk factors
- verification steps

Agents then combine plans into:

plans/consensus_plan.md

Claude must approve the final consensus plan.

No coding begins until the consensus plan exists.

---

# Phase 5 — Implementation Corrections

Agents:
Gemini + Qwen2Coder

If drift exists:

- disable unintended Doom gameplay
- ensure gallery objective overrides gameplay state
- confirm gallery logic loads during initialization

Output location:

features/gallery_alignment_fixes/

---

# Phase 6 — Browser Runtime Testing

Agents:
Gemini + Qwen2Coder

Tasks:

- run Doom engine in browser
- verify map loads
- verify player camera initializes

Output:

tests/browser_runtime.md

---

# Phase 7 — Gallery Verification

Agents:
Zencoder + Gemini

Verify:

- gallery objective appears inside the game
- gameplay systems do not override gallery mode
- navigation allows gallery exploration

Output:

tests/gallery_verification.md

---

# Success Criteria

Project is considered successful when:

- Doom launches in browser
- gallery objective displays inside game
- gameplay mechanics do not override gallery mode
- all agents confirm alignment
- Claude approves final report