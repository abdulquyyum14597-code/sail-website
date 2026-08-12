/* ============================================================
   hero-canvas.js — Animated particle network for the homepage hero.
   Only loaded on index.html. Pure vanilla JS + Canvas API.
   ============================================================ */

(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles, animId;
  const PARTICLE_COUNT = 55;
  const CONNECTION_DIST = 140;
  const SPEED = 0.35;

  // Check prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionOk = !prefersReduced.matches;
  prefersReduced.addEventListener('change', () => {
    motionOk = !prefersReduced.matches;
    if (!motionOk && animId) { cancelAnimationFrame(animId); animId = null; }
    if (motionOk && !animId) loop();
  });

  // Theme-aware colors
  function getColors() {
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
      return {
        particle: 'rgba(45, 179, 174, 0.7)',
        particleAlt: 'rgba(245, 177, 42, 0.5)',
        line: 'rgba(45, 179, 174, 0.12)',
        glow: 'rgba(45, 179, 174, 0.3)'
      };
    } else if (theme === 'light') {
      return {
        particle: 'rgba(28, 124, 120, 0.5)',
        particleAlt: 'rgba(212, 160, 23, 0.35)',
        line: 'rgba(28, 124, 120, 0.08)',
        glow: 'rgba(28, 124, 120, 0.15)'
      };
    }
    // Original
    return {
      particle: 'rgba(28, 124, 120, 0.65)',
      particleAlt: 'rgba(212, 160, 23, 0.45)',
      line: 'rgba(28, 124, 120, 0.1)',
      glow: 'rgba(28, 124, 120, 0.25)'
    };
  }

  function resize() {
    const hero = canvas.parentElement;
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED * 2,
        vy: (Math.random() - 0.5) * SPEED * 2,
        r: Math.random() * 2 + 1,
        isAlt: Math.random() < 0.2  // 20% gold accent particles
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const colors = getColors();

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const opacity = 1 - dist / CONNECTION_DIST;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = colors.line.replace(/[\d.]+\)$/, (opacity * 0.15).toFixed(3) + ')');
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      // Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = p.isAlt ? colors.particleAlt : colors.glow;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.isAlt ? colors.particleAlt : colors.particle;
      ctx.fill();
    }
  }

  function update() {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Keep in bounds
      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));
    }
  }

  function loop() {
    if (!motionOk) return;
    update();
    draw();
    animId = requestAnimationFrame(loop);
  }

  function init() {
    resize();
    createParticles();
    if (motionOk) loop();
    else draw(); // Draw one static frame even if motion disabled
  }

  window.addEventListener('resize', () => {
    resize();
    // Recreate particles on large resize to keep them distributed
    if (particles) {
      for (const p of particles) {
        if (p.x > width) p.x = Math.random() * width;
        if (p.y > height) p.y = Math.random() * height;
      }
    }
  });

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
