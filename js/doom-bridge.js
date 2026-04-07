/**
 * doom-bridge.js
 * Polls WASM memory for exhibit tag activations.
 * When player shoots a painting (linedef special 24 fires), C code writes the tag
 * to a global variable. This polls every frame and triggers exhibit:shot events.
 */

class DoomBridge {
  constructor(doomEngine) {
    this.doomEngine = doomEngine;
    this.lastTag = 0;
    this.pollingInterval = null;
  }

  /**
   * Start polling WASM memory for exhibit activations.
   * Called after DOOM engine is ready.
   */
  start() {
    // Poll every 16ms (60 FPS)
    this.pollingInterval = setInterval(() => this.poll(), 16);
  }

  /**
   * Stop polling.
   */
  stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Poll WASM memory for activated exhibit tag.
   * Calls Module._get_exhibit_tag() which returns 0 if no tag, or 1001–1064 if activated.
   */
  poll() {
    if (!this.doomEngine.isReady || !window.Module) return;

    // Call exported C function to get the activated tag
    let tag = 0;
    try {
      tag = window.Module._get_exhibit_tag?.() || 0;
    } catch (e) {
      console.error('Error polling exhibit tag:', e);
      return;
    }

    // If tag changed and is valid (1001–1064), emit event
    if (tag > 0 && tag !== this.lastTag && tag >= 1001 && tag <= 1064) {
      const exhibitIndex = tag - 1001;
      this.lastTag = tag;

      // Dispatch exhibit:shot event with index
      window.dispatchEvent(new CustomEvent('exhibit:shot', {
        detail: { tag, exhibitIndex }
      }));

      // Reset tag in C code (optional, depending on C implementation)
      // If C side doesn't auto-reset, we might call:
      // window.Module._clear_exhibit_tag?.();
    }
  }
}
