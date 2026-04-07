/**
 * explosion.js
 * Canvas 2D particle effect for painting destruction.
 * 80ms screen flash + fire particles (0–300ms) + smoke (200–400ms).
 */

class ExplosionEffect {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isPlaying = false;
    this.startTime = 0;
    this.particles = [];
  }

  /**
   * Create and initialize a transparent overlay canvas for particles.
   */
  async init() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'explosion-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none'; // Don't block DOOM controls
    this.canvas.style.zIndex = '10000';
    this.canvas.style.display = 'none';

    // Set canvas size to window
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ctx = this.canvas.getContext('2d');
    document.body.appendChild(this.canvas);

    // Handle window resize
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
  }

  /**
   * Play explosion at screen center.
   * Resolves when animation completes (400ms).
   */
  play(onComplete) {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.startTime = performance.now();
    this.particles = [];
    this.canvas.style.display = 'block';

    // Create fire particles
    for (let i = 0; i < 40; i++) {
      this.particles.push(this.createFireParticle());
    }

    // Create smoke particles (delayed by 100ms)
    for (let i = 0; i < 15; i++) {
      this.particles.push(this.createSmokeParticle(100));
    }

    // Animation loop
    const animate = (now) => {
      const elapsed = now - this.startTime;
      if (elapsed > 400) {
        // Animation complete
        this.isPlaying = false;
        this.canvas.style.display = 'none';
        if (onComplete) onComplete();
        return;
      }

      // Clear canvas
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw screen flash (0–80ms)
      if (elapsed < 80) {
        const flashAlpha = 0.6 * (1 - elapsed / 80); // Fade out
        this.ctx.fillStyle = `rgba(255, 69, 0, ${flashAlpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }

      // Update and draw particles
      for (const particle of this.particles) {
        this.updateParticle(particle, elapsed);
        this.drawParticle(particle);
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  createFireParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 8; // 4–12 px/frame

    return {
      type: 'fire',
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2, // Bias upward
      radius: 4,
      lifetime: 30, // frames @ 60fps = 500ms
      age: 0,
      colors: ['#FFFFFF', '#FFFF00', '#FF8C00', '#FF0000']
    };
  }

  createSmokeParticle(delayMs) {
    const angle = Math.PI * 0.5 + (Math.random() - 0.5) * 0.4; // Mostly upward
    const speed = 1 + Math.random() * 2; // 1–3 px/frame

    return {
      type: 'smoke',
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      vx: 0,
      vy: -speed, // Upward
      radius: 10,
      lifetime: 60, // frames @ 60fps = 1000ms
      age: -Math.round(delayMs / 16.6), // Negative age = delayed start
      colors: [
        'rgba(100, 100, 100, 0.5)',
        'rgba(80, 80, 80, 0.3)',
        'rgba(50, 50, 50, 0)'
      ]
    };
  }

  updateParticle(p, elapsedMs) {
    const frameTime = 16.6; // ms per frame at 60 FPS
    p.age++;

    if (p.type === 'fire') {
      // Gravity up (negative, pushing toward sky)
      p.vy += -0.1; // -0.1 px/frame²
      // Drag
      p.vx *= 0.96;
      p.vy *= 0.96;
      // Shrink radius
      const lifetimeRatio = p.age / p.lifetime;
      p.radius = 4 * (1 - lifetimeRatio);
    } else if (p.type === 'smoke') {
      // Gravity slight upward
      p.vy -= 0.05;
      // Drag
      p.vx *= 0.98;
      p.vy *= 0.98;
      // Expand radius
      const lifetimeRatio = Math.max(0, p.age / p.lifetime);
      p.radius = 10 + 30 * lifetimeRatio;
    }

    // Update position
    p.x += p.vx;
    p.y += p.vy;
  }

  drawParticle(p) {
    if (p.age < 0 || p.age > p.lifetime) return;

    const lifetimeRatio = p.age / p.lifetime;
    let color;

    if (p.type === 'fire') {
      // Interpolate color: white → yellow → orange → red
      const numColors = p.colors.length;
      const colorIdx = Math.min(numColors - 1, Math.floor(lifetimeRatio * numColors));
      color = p.colors[colorIdx];
    } else if (p.type === 'smoke') {
      // Interpolate smoke colors
      const numColors = p.colors.length;
      const colorIdx = Math.min(numColors - 1, Math.floor(lifetimeRatio * numColors));
      color = p.colors[colorIdx];
    }

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
