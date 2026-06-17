/* ============================================================
   PARTICLES.JS — Neural network particle canvas
   Mouse-reactive nodes with teal connection lines
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  let W        = 0;
  let H        = 0;
  let mouse    = { x: -9999, y: -9999 };
  let raf      = null;
  let nodes    = [];
  let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Config ────────────────────────────────────────────────
  const CONFIG = {
    nodeCount:        55,
    nodeRadius:       2.2,
    nodeColor:        '45, 122, 107',   // accent teal (RGB)
    lineColor:        '45, 122, 107',
    maxDist:          150,
    mouseRadius:      180,
    speed:            0.38,
    pulseSpeed:       0.018,
    mouseAttractionStrength: 0.025,
  };

  // ── Resize ────────────────────────────────────────────────
  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  // ── Node factory ──────────────────────────────────────────
  function createNode() {
    return {
      x:      Math.random() * W,
      y:      Math.random() * H,
      vx:     (Math.random() - 0.5) * CONFIG.speed,
      vy:     (Math.random() - 0.5) * CONFIG.speed,
      radius: CONFIG.nodeRadius + Math.random() * 1.2,
      pulse:  Math.random() * Math.PI * 2,
    };
  }

  function initNodes() {
    nodes = [];
    for (let i = 0; i < CONFIG.nodeCount; i++) {
      nodes.push(createNode());
    }
  }

  // ── Update ────────────────────────────────────────────────
  function update() {
    nodes.forEach(n => {
      // Gentle mouse attraction
      const dx   = mouse.x - n.x;
      const dy   = mouse.y - n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.mouseRadius && dist > 0) {
        const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
        n.vx += (dx / dist) * force * CONFIG.mouseAttractionStrength;
        n.vy += (dy / dist) * force * CONFIG.mouseAttractionStrength;
      }

      // Speed cap
      const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (speed > CONFIG.speed * 2.5) {
        n.vx = (n.vx / speed) * CONFIG.speed * 2.5;
        n.vy = (n.vy / speed) * CONFIG.speed * 2.5;
      }

      // Damping
      n.vx *= 0.995;
      n.vy *= 0.995;

      n.x += n.vx;
      n.y += n.vy;
      n.pulse += CONFIG.pulseSpeed;

      // Bounce off walls
      if (n.x < 0)  { n.x  = 0;  n.vx *= -1; }
      if (n.x > W)  { n.x  = W;  n.vx *= -1; }
      if (n.y < 0)  { n.y  = 0;  n.vy *= -1; }
      if (n.y > H)  { n.y  = H;  n.vy *= -1; }
    });
  }

  // ── Draw ──────────────────────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a  = nodes[i];
        const b  = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);

        if (d < CONFIG.maxDist) {
          // Mouse proximity boosts line opacity
          const mdA = Math.sqrt(
            Math.pow(mouse.x - a.x, 2) + Math.pow(mouse.y - a.y, 2)
          );
          const mdB = Math.sqrt(
            Math.pow(mouse.x - b.x, 2) + Math.pow(mouse.y - b.y, 2)
          );
          const nearMouse = Math.min(mdA, mdB) < CONFIG.mouseRadius;
          const alpha     = (1 - d / CONFIG.maxDist) * (nearMouse ? 0.35 : 0.12);

          ctx.beginPath();
          ctx.strokeStyle = `rgba(${CONFIG.lineColor}, ${alpha})`;
          ctx.lineWidth   = nearMouse ? 1.2 : 0.7;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      const pulseFactor = 1 + Math.sin(n.pulse) * 0.22;
      const r           = n.radius * pulseFactor;

      // Mouse proximity
      const md = Math.sqrt(
        Math.pow(mouse.x - n.x, 2) + Math.pow(mouse.y - n.y, 2)
      );
      const nearMouse = md < CONFIG.mouseRadius;
      const alpha     = nearMouse
        ? 0.75 + (1 - md / CONFIG.mouseRadius) * 0.25
        : 0.45;

      // Glow
      if (nearMouse) {
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
        glow.addColorStop(0, `rgba(${CONFIG.nodeColor}, 0.18)`);
        glow.addColorStop(1, `rgba(${CONFIG.nodeColor}, 0)`);
        ctx.beginPath();
        ctx.fillStyle = glow;
        ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.fillStyle = `rgba(${CONFIG.nodeColor}, ${alpha})`;
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ── Loop ──────────────────────────────────────────────────
  function loop() {
    if (!prefersReducedMotion) {
      update();
      draw();
    }
    raf = requestAnimationFrame(loop);
  }

  // ── Events ───────────────────────────────────────────────
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Touch support
  canvas.addEventListener('touchmove', e => {
    const rect   = canvas.getBoundingClientRect();
    const touch  = e.touches[0];
    mouse.x = touch.clientX - rect.left;
    mouse.y = touch.clientY - rect.top;
  }, { passive: true });

  window.addEventListener('resize', () => {
    resize();
    initNodes();
  });

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
    prefersReducedMotion = e.matches;
    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, W, H);
    }
  });

  // ── Init ──────────────────────────────────────────────────
  resize();
  initNodes();
  loop();

})();
