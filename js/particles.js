/* ============================================================
   PARTICLES.JS — Enhanced neural network hero canvas
   ============================================================ */
(function () {
  'use strict';

  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0;
  let mouse = { x: -9999, y: -9999, active: false };
  let nodes = [];
  let raf = null;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CFG = {
    count:         70,
    radius:        2.4,
    color:         '45,122,107',
    maxDist:       160,
    mouseRadius:   220,
    speed:         0.45,
    pulseSpeed:    0.02,
    attraction:    0.032,
    repulsion:     0.015,
  };

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  function mkNode() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * CFG.speed,
      vy: (Math.random() - 0.5) * CFG.speed,
      r:  CFG.radius + Math.random() * 1.4,
      pulse: Math.random() * Math.PI * 2,
      energy: 0,
    };
  }

  function init() {
    nodes = Array.from({ length: CFG.count }, mkNode);
  }

  function update() {
    nodes.forEach(n => {
      const dx = mouse.x - n.x;
      const dy = mouse.y - n.y;
      const d  = Math.sqrt(dx * dx + dy * dy);

      if (d < CFG.mouseRadius && d > 0) {
        const force = (CFG.mouseRadius - d) / CFG.mouseRadius;
        n.vx += (dx / d) * force * CFG.attraction;
        n.vy += (dy / d) * force * CFG.attraction;
        n.energy = Math.max(n.energy, force);
      } else {
        n.energy *= 0.95;
      }

      // Slight repulsion between nodes to prevent clumping
      nodes.forEach(m => {
        if (m === n) return;
        const ex = n.x - m.x;
        const ey = n.y - m.y;
        const ed = Math.sqrt(ex*ex + ey*ey);
        if (ed < 30 && ed > 0) {
          n.vx += (ex / ed) * CFG.repulsion;
          n.vy += (ey / ed) * CFG.repulsion;
        }
      });

      // Speed cap
      const spd = Math.sqrt(n.vx*n.vx + n.vy*n.vy);
      if (spd > CFG.speed * 3) {
        n.vx = (n.vx / spd) * CFG.speed * 3;
        n.vy = (n.vy / spd) * CFG.speed * 3;
      }

      n.vx *= 0.993;
      n.vy *= 0.993;
      n.x  += n.vx;
      n.y  += n.vy;
      n.pulse += CFG.pulseSpeed + n.energy * 0.03;

      if (n.x < 0)  { n.x = 0;  n.vx *= -1; }
      if (n.x > W)  { n.x = W;  n.vx *= -1; }
      if (n.y < 0)  { n.y = 0;  n.vy *= -1; }
      if (n.y > H)  { n.y = H;  n.vy *= -1; }
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d > CFG.maxDist) continue;

        const mdA = Math.hypot(mouse.x - a.x, mouse.y - a.y);
        const mdB = Math.hypot(mouse.x - b.x, mouse.y - b.y);
        const near = Math.min(mdA, mdB) < CFG.mouseRadius;
        const energyBoost = (a.energy + b.energy) * 0.5;
        const alpha = (1 - d / CFG.maxDist) * (near ? 0.45 : 0.10) + energyBoost * 0.3;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${CFG.color},${Math.min(alpha, 0.7)})`;
        ctx.lineWidth   = near ? 1.4 : 0.7;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        // Pulse travelling along energised connections
        if (near && energyBoost > 0.1) {
          const t   = (Date.now() % 2000) / 2000;
          const px  = a.x + (b.x - a.x) * t;
          const py  = a.y + (b.y - a.y) * t;
          ctx.beginPath();
          ctx.fillStyle = `rgba(${CFG.color},${energyBoost * 0.8})`;
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Nodes
    nodes.forEach(n => {
      const pf  = 1 + Math.sin(n.pulse) * (0.25 + n.energy * 0.4);
      const r   = n.r * pf;
      const md  = Math.hypot(mouse.x - n.x, mouse.y - n.y);
      const near = md < CFG.mouseRadius;
      const alpha = near ? 0.8 + (1 - md / CFG.mouseRadius) * 0.2 : 0.45;

      if (near || n.energy > 0.1) {
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5);
        glow.addColorStop(0, `rgba(${CFG.color},${0.25 + n.energy * 0.3})`);
        glow.addColorStop(1, `rgba(${CFG.color},0)`);
        ctx.beginPath();
        ctx.fillStyle = glow;
        ctx.arc(n.x, n.y, r * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(${CFG.color},${alpha})`;
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function loop() {
    if (!prefersReduced) { update(); draw(); }
    raf = requestAnimationFrame(loop);
  }

  // Mouse tracking on the whole page (not just canvas)
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999; mouse.y = -9999; mouse.active = false;
  });

  canvas.addEventListener('touchmove', e => {
    const rect  = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouse.x = touch.clientX - rect.left;
    mouse.y = touch.clientY - rect.top;
  }, { passive: true });

  window.addEventListener('resize', () => { resize(); init(); });

  resize();
  init();
  loop();
})();