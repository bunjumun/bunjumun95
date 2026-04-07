# ZENCODER DELIVERY INSTRUCTIONS
## How to Save & Format Your Work

---

## File Locations & Naming

Save all deliverables with these exact paths & names in the `/Users/bunj/claude/portfolio maze/.claude/` directory:

### 1. Maze Sizing Formula
**File:** `.claude/ZENCODER-MAZE-FORMULA.md`

**Format:** Markdown with code blocks
```markdown
# Maze Sizing Formula Recommendation

## Analysis Summary
[Your analysis of current formula vs alternatives]

## Recommended Formula
\`\`\`javascript
const ROOMS = Math.max(5, [YOUR_FORMULA_HERE]);
\`\`\`

## Rationale
[Why this formula works better]

## Test Cases
- 1 exhibit → X rooms (reason)
- 3 exhibits → X rooms (reason)
- 10 exhibits → X rooms (reason)
- 20 exhibits → X rooms (reason)

## Performance Notes
[Any performance impact of the formula]
```

---

### 2. UX Discovery Concept
**File:** `.claude/ZENCODER-UX-DISCOVERY.md`

**Format:** Markdown with mockup description + code snippets
```markdown
# Exhibit Discovery UX Concept

## Problem
[What we're solving]

## Recommended Solution
[Which option: A/B/C/D or custom]

## How It Works
[Step-by-step user experience]

## HTML/CSS Implementation
\`\`\`html
[Code snippet showing overlay, guide, or tracker]
\`\`\`

## JavaScript Hook
\`\`\`javascript
[Code showing how to integrate into main.js]
\`\`\`

## First-Time User Journey
1. User loads site
2. [What they see]
3. [Call to action]
4. [Result]
```

---

### 3. Settings Menu Design
**File:** `.claude/ZENCODER-SETTINGS-MENU.md`

**Format:** Markdown + HTML/CSS template
```markdown
# Win95-Style Settings Menu

## Menu Structure
- File
  - Reset Gallery
  - Exit
- View
  - Difficulty (Easy/Normal/Hard)
  - Graphics Quality (Low/Medium/High)
  - Show Minimap
  - Show Exhibit Stats
- Help
  - About
  - Controls Guide

## HTML Template
\`\`\`html
[Complete menu structure with IDs for JavaScript hooks]
\`\`\`

## CSS Styling
\`\`\`css
[Win95 menu styling - submenus, hover states, active states]
\`\`\`

## JavaScript Integration
\`\`\`javascript
[Event listeners + state management]
\`\`\`

## Screenshot/Mockup Description
[ASCII art or detailed description of how menu looks]
```

---

### 4. Performance Audit
**File:** `.claude/ZENCODER-PERFORMANCE-AUDIT.md`

**Format:** Markdown with optimization recommendations
```markdown
# Performance Audit & Optimization Guide

## Profiling Results
### Top 3 Bottlenecks
1. [Component] - [Estimated impact]
   - Current: [ms]
   - Optimization: [description]
   - Expected improvement: [ms]
2. [Component] - [Estimated impact]
3. [Component] - [Estimated impact]

## Optimization Recommendations

### Quick Wins (< 1 hour)
- [Optimization 1]
- [Optimization 2]

### Medium Effort (1–3 hours)
- [Optimization 3]

### Code Snippets
\`\`\`javascript
[Optimized code for each recommendation]
\`\`\`

## Performance Budget
- Maze generation: < 300ms
- Texture creation: < 200ms
- Initial frame placement: < 100ms
- Total load time: < 1s

## Chrome DevTools Tips
[Instructions for user to profile themselves]
```

---

### 5. Advanced Features (Optional)
**File:** `.claude/ZENCODER-ADVANCED-FEATURES.md`

**Format:** Markdown brainstorm + feasibility matrix
```markdown
# Advanced Features Brainstorm

## Feature Concepts
### Concept 1: [Feature Name]
- **Idea:** [Description]
- **User Value:** [Why users want this]
- **Difficulty:** Easy / Medium / Hard
- **Time Estimate:** [hours]
- **Implementation Path:** [2-3 steps]

### Concept 2: [Feature Name]
...

## Feasibility Matrix
| Feature | Difficulty | Value | Effort | Priority |
|---------|-----------|-------|--------|----------|
| Feature 1 | Easy | High | 4h | High |
| Feature 2 | Medium | Medium | 8h | Medium |
| Feature 3 | Hard | High | 20h | Low |

## Recommendations for Phase 2
[Which features should we do next?]
```

---

## Delivery Checklist

✅ **Must Include:**
- [ ] Maze formula recommendation with test cases
- [ ] UX discovery concept with integration code
- [ ] Settings menu HTML/CSS template
- [ ] Performance audit with top 3 fixes
- [ ] JavaScript snippets (ready to integrate)

⚠️ **Format Requirements:**
- Use Markdown (`.md` files)
- Include code blocks with language tags (` ```javascript `, ` ```css `, ` ```html `)
- All files must be valid UTF-8 text
- File names must match exactly: `ZENCODER-[NAME].md`

📍 **Save Location:**
```
/Users/bunj/claude/portfolio maze/.claude/ZENCODER-[DELIVERABLE].md
```

---

## What Claude Code Will Do With Your Work

1. **Read** all `.md` files you create
2. **Extract** code snippets and integrate into:
   - `js/main.js` (maze formula)
   - `js/admin.js` (settings menu)
   - `css/style.css` (menu styling)
   - `index.html` (new UI elements)
3. **Test** locally (Python HTTP server on port 3000)
4. **Commit** and push to GitHub
5. **Validate** on live site: https://bunjumun.github.io/bunjumun95

---

## Questions for Zencoder

Before starting, confirm:
1. Do you want to test the maze formula with real user feedback, or use heuristics?
2. For UX discovery: should we show hints on load, or only on first visit?
3. Settings menu: should difficulty change the maze size in real-time, or only on reload?
4. Performance: should we prioritize initial load speed or frame rate during navigation?

---

## Example File Structure (After Delivery)

```
.claude/
├── ZENCODER-HANDOFF.md              (original request)
├── ZENCODER-HANDOFF-v2.md           (expanded request)
├── ZENCODER-MAZE-FORMULA.md         ← CREATE THIS
├── ZENCODER-UX-DISCOVERY.md         ← CREATE THIS
├── ZENCODER-SETTINGS-MENU.md        ← CREATE THIS
├── ZENCODER-PERFORMANCE-AUDIT.md    ← CREATE THIS
├── ZENCODER-ADVANCED-FEATURES.md    ← CREATE THIS (optional)
├── launch.json
└── [other config files]
```

---

**Ready to receive zencoder's work!**

Pass these instructions to zencoder, and I'll integrate everything upon delivery.
