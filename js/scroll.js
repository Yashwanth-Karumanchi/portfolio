/* ============================================================
   SCROLL.JS — Reveals + XP bar + graffiti at 100%
   ============================================================ */
(function () {
  'use strict';

  // ── Reveal on scroll ──────────────────────────────────────
  const reveals = document.querySelectorAll('.reveal, .stagger-children');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => revealObs.observe(el));

  // ── XP Bar ────────────────────────────────────────────────
  const xpFill    = document.getElementById('xpFill');
  const xpPercent = document.getElementById('xpPercent');
  const xpContainer = document.getElementById('xpContainer');
  let graffitiShown = false;
  let xpHidden      = false;

  function updateXP() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.body.scrollHeight - window.innerHeight;
    const pct        = Math.min(100, Math.round((scrollTop / docHeight) * 100));

    if (xpFill)    xpFill.style.width = pct + '%';
    if (xpPercent) xpPercent.textContent = pct;

    // Hide XP bar near footer so it doesn't obscure it
    if (pct >= 98 && !xpHidden) {
      xpHidden = true;
      if (xpContainer) {
        xpContainer.style.transition = 'opacity 0.6s, transform 0.6s';
        xpContainer.style.opacity    = '0';
        xpContainer.style.transform  = 'translateX(-50%) translateY(20px)';
        setTimeout(() => { if (xpContainer) xpContainer.style.display = 'none'; }, 650);
      }
    } else if (pct < 95 && xpHidden) {
      xpHidden = false;
      if (xpContainer) {
        xpContainer.style.display = '';
        setTimeout(() => {
          xpContainer.style.opacity   = '1';
          xpContainer.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
      }
    }

    // 100% graffiti
    if (pct >= 99 && !graffitiShown) {
      graffitiShown = true;
      showGraffiti();
    }

    // Milestone achievements
    if (pct >= 25  && !window._xp25)  { window._xp25  = true; window._achievements?.unlock('explorer'); }
    if (pct >= 60  && !window._xp60)  { window._xp60  = true; window._achievements?.unlock('researcher'); }
    if (pct >= 100 && !window._xp100) { window._xp100 = true; window._achievements?.unlock('completionist'); }
  }

  function showGraffiti() {
    const g = document.createElement('div');

    g.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      width: min(420px, calc(100vw - 32px));
      transform: translateX(-50%);
      font-family: 'Space Grotesk', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary);
      background: #fff;
      padding: 14px 22px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(45,122,107,0.22);
      border: 2px solid var(--accent);
      z-index: 9990;
      pointer-events: none;
      animation: scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
      text-align: center;
      letter-spacing: -0.02em;
    `;

    g.innerHTML = '🎉 You explored everything!<br><span style="font-size:13px;font-weight:400;color:var(--text-muted);font-family:var(--font-mono)">Reach out — I\\'d love to chat.</span>';

    document.body.appendChild(g);

    setTimeout(() => {
      g.style.transition = 'opacity 0.5s, transform 0.5s';
      g.style.opacity = '0';
      g.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => g.remove(), 600);
    }, 3500);
  }

  window.addEventListener('scroll', updateXP, { passive: true });
  updateXP();

  // ── Section achievement tracking ──────────────────────────
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        if (id === 'research') window._achievements?.unlock('researcher');
        if (id === 'projects') window._achievements?.unlock('project_viewer');
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('section[id]').forEach(s => sectionObs.observe(s));

})();