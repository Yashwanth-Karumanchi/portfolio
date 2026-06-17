/* ============================================================
   EASTER-EGGS.JS — Konami code, name typing, logo click
   ============================================================ */

(function () {
  'use strict';

  // ── Konami Code ───────────────────────────────────────────
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
                  'b','a'];
  let konamiIdx = 0;

  document.addEventListener('keydown', e => {
    if (e.key === KONAMI[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0;
        triggerMatrixRain();
        window._achievements?.unlock('konami');
      }
    } else {
      konamiIdx = 0;
    }
  });

  // ── Name typing easter egg ────────────────────────────────
  let nameBuffer = '';
  let nameTimer  = null;

  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length !== 1) return;

    nameBuffer += e.key.toLowerCase();
    clearTimeout(nameTimer);
    nameTimer = setTimeout(() => { nameBuffer = ''; }, 1200);

    if (nameBuffer.includes('yashwanth')) {
      nameBuffer = '';
      triggerConfetti();
      window._achievements?.unlock('easter_egg');
    }
  });

  // ── Logo triple click ─────────────────────────────────────
  const logo      = document.querySelector('.navbar-logo');
  let   logoClicks = 0;
  let   logoTimer  = null;

  if (logo) {
    logo.addEventListener('click', e => {
      e.preventDefault();
      logoClicks++;
      clearTimeout(logoTimer);
      logoTimer = setTimeout(() => { logoClicks = 0; }, 600);
      if (logoClicks >= 3) {
        logoClicks = 0;
        triggerMatrixRain();
        window._achievements?.unlock('easter_egg');
      }
    });
  }

  // ── Confetti ──────────────────────────────────────────────
  function triggerConfetti() {
    const colors = ['#2D7A6B','#3D9A87','#E8F4F1','#1A1A1A','#F2EDE8'];
    const count  = 80;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.style.cssText = `
        position: fixed;
        top: -20px;
        left: ${Math.random() * 100}vw;
        width: ${4 + Math.random() * 6}px;
        height: ${4 + Math.random() * 6}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        z-index: 9999;
        pointer-events: none;
        animation: confettiDrop ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.8}s forwards;
      `;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 4000);
    }

    // Fun message
    const msg = document.createElement('div');
    msg.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 700;
      color: var(--accent);
      background: white;
      padding: 20px 36px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      z-index: 9999;
      pointer-events: none;
      animation: scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
      text-align: center;
    `;
    msg.innerHTML = '🎉 You typed my name!<br><span style="font-size:14px;font-weight:400;color:#6B7280;font-family:var(--font-mono)">Nice to meet you!</span>';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  }

  // ── Matrix Rain ───────────────────────────────────────────
  function triggerMatrixRain() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;

    const ctx    = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = `
      position: fixed; inset: 0; z-index: 9998;
      pointer-events: none; opacity: 0;
      transition: opacity 0.3s;
    `;

    setTimeout(() => { canvas.style.opacity = '0.85'; }, 10);

    const cols    = Math.floor(canvas.width / 16);
    const drops   = Array(cols).fill(1);
    const chars   = 'YASHWANTH01アカサタナハマヤラワ';

    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(18, 18, 18, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#2D7A6B';
      ctx.font      = '14px JetBrains Mono, monospace';

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 16, y * 16);
        if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }, 40);

    setTimeout(() => {
      canvas.style.opacity = '0';
      setTimeout(() => {
        clearInterval(interval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, 400);
    }, 3000);
  }

  // Expose for other modules
  window._easterEggs = { triggerConfetti, triggerMatrixRain };

})();
