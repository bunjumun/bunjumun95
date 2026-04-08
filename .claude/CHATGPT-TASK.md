# CHATGPT TASK — Review & Improve Win95 Game Menu + FPS Mode

You are helping build a Windows 95-themed portfolio maze website (Three.js, vanilla JS, no build step).

## What was just built (by local Ollama models):
A Win95-style game menu (`js/menu.js`) that shows at page load with these buttons:
- START EXPLORATION (fires `menu:start` event)
- SETTINGS
- ADMIN CONSOLE
- FPS MODE (F key activates pointer-lock shooting in maze)
- CREDITS

## Your tasks:

### 1. Review menu.js for correctness
The code uses Shadow DOM (`attachShadow({mode:'open'})`). The host element is appended to `document.body`.
Key concern: Does the `_start()` method correctly dispatch to `document`? Does the Enter key handler work?

### 2. Suggest Win95 aesthetic improvements
The current styling uses #C0C0C0 background, #000080 titlebar, #008080 desktop.
How can it look more authentically Windows 95? Consider: window chrome, button bevels, cursor style, fonts.

### 3. Review the FPS mode implementation
When the user presses F in the maze:
- `canvas.requestPointerLock()` is called
- Mouse sensitivity switches to pointer-lock delta (not mousemove offset)
- `document.body.classList.add('fps-active')` changes crosshair color to red

Is there anything missing for a complete pointer-lock FPS experience in Three.js?

### 4. Suggest any additions to the game menu
What else would make this feel like a real Win95 application launcher?

## Context
- Repo: bunjumun/bunjumun95 (GitHub)
- Live site: bunjumun.github.io/bunjumaze
- Win95 palette: #C0C0C0 window, #000080 titlebar, #008080 desktop teal
- All UI lives in Shadow DOM (no global CSS bleed)
- gallery.json holds 14 exhibits that get placed on maze walls automatically

Please respond with specific code suggestions.
