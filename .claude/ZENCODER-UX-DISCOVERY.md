# Exhibit Discovery UX Concept

## Problem
Players add exhibits but still wonder "Where do I find them?"—the maze currently hides new frames without any upfront guidance, causing first-time users to get lost in the fog.

## Recommended Solution
**Hybrid of Option D + A:** show a mini-guide overlay on first load (Option D) and keep a persistent exhibit count + nearest-frame hint (Option A) in the HUD.

## How It Works
1. On load, the overlay briefly appears with the exhibit/frame count, title of the nearest exhibit, and a “Highlight path” button.
2. The overlay shows a “NEW” badge for any exhibit added since the last visit by comparing timestamps in `localStorage`.
3. The HUD pill updates while the player moves, showing the nearest exhibit title and the estimated distance.
4. Clicking “Highlight path” triggers a short-lived breadcrumb (glowing arrows) and logs the discovery event for the admin console.

## HTML/CSS Implementation
```html
<div id="exhibit-guide" class="guide-overlay hidden">
  <header>Exhibit Discovery</header>
  <p class="guide-count">3 exhibits · 3 frames</p>
  <p class="guide-next">Next up: <strong>Flickering Hall</strong></p>
  <button id="guide-highlight" class="guide-button">Highlight path</button>
</div>
```
```css
#exhibit-guide {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.8);
  border: 2px outset #fff;
  font-family: "MS Sans Serif", sans-serif;
  color: #f7f7f7;
  z-index: 1000;
  width: 230px;
}
#exhibit-guide.hidden {
  opacity: 0;
  pointer-events: none;
}
.guide-button {
  margin-top: 0.75rem;
  background: #00aaff;
  border: 1px solid #002f5b;
  padding: 0.35rem 0.85rem;
  color: #fff;
  cursor: pointer;
}
```

## JavaScript Hook
```javascript
const guideOverlay = document.getElementById("exhibit-guide");
const highlightBtn = document.getElementById("guide-highlight");
const exhibitCount = gallery?.exhibits?.length || 0;
function showGuide() {
  if (!guideOverlay) return;
  guideOverlay.querySelector(".guide-count").textContent = `${exhibitCount} exhibits · ${exhibitCount} frames`;
  guideOverlay.classList.remove("hidden");
  setTimeout(() => guideOverlay.classList.add("hidden"), 10000);
}
highlightBtn?.addEventListener("click", () => {
  highlightNearestExhibit();
  logDiscovery("guide-highlight");
});
requestAnimationFrame(showGuide);
```

## First-Time User Journey
1. **User loads the site** → overlay slides in with exhibit/frame counts, labeled nearest exhibit, and a CTA.
2. **They click “Highlight path”** → subtle glowing arrows trace the corridor to the nearest frame.
3. **HUD pill** (bottom-left) keeps updating with the closest exhibit distance.
4. **Result:** Users instantly know how many exhibits are present and where to begin exploration.
