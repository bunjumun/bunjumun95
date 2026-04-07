// ── AudioManager ──────────────────────────────────────────────────────────────
// Shared AudioContext with separate GainNode mixers for Maze and DOOM modes.
// Prevents double-context browser limits and handles autoplay policy.
// Architecture: zencoder docs/doom-integration/01-architecture-api.md §3
// ─────────────────────────────────────────────────────────────────────────────

class AudioManager {
  constructor() {
    this.context   = new (window.AudioContext || window.webkitAudioContext)();
    this.mazeMixer = this.context.createGain();
    this.doomMixer = this.context.createGain();

    this.mazeMixer.connect(this.context.destination);
    this.doomMixer.connect(this.context.destination);

    // Maze active by default; DOOM muted until loaded
    this.mazeMixer.gain.value = 1;
    this.doomMixer.gain.value = 0;
  }

  async resumeContext() {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    // Keep audio thread alive during WASM load
    const osc = this.context.createOscillator();
    osc.connect(this.mazeMixer);
    osc.frequency.value = 0;
    osc.start();
    osc.stop(this.context.currentTime + 0.001);
  }

  crossfade(fromMode, toMode, duration = 0.5) {
    const now = this.context.currentTime;
    if (fromMode === 'maze' && toMode === 'doom') {
      this.mazeMixer.gain.linearRampToValueAtTime(0, now + duration);
      this.doomMixer.gain.linearRampToValueAtTime(1, now + duration);
    } else {
      this.doomMixer.gain.linearRampToValueAtTime(0, now + duration);
      this.mazeMixer.gain.linearRampToValueAtTime(1, now + duration);
    }
  }

  muteAll() {
    this.mazeMixer.gain.value = 0;
    this.doomMixer.gain.value = 0;
  }
}
