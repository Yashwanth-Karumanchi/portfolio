/* ============================================================
   SCROLL.JS — IntersectionObserver reveals + XP bar
   ============================================================ */

(function () {
  'use strict';

  // ── Reveal on scroll ──────────────────────────────────────
  const reveals = document.querySelectorAll('.reveal, .stagger-children');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));

  // ── XP Bar ────────────────────────────────────────────────
  const xpFill    = document.getElementById('xpFill');
  const xpPercent = document.getElementById('xpPercent');

  function updateXP() {
    const scrollTop    = window.scrollY;
    const docHeight    = document.body.scrollHeight - window.innerHeight;
    const pct          = Math.min(100, Math.round((scrollTop / docHeight) * 100));
    if (xpFill)    xpFill.style.width = pct + '%';
    if (xpPercent) xpPercent.textContent = pct;

    // Milestone achievements
    if (pct >= 25  && !window._xp25)  { window._xp25  = true; window._achievements?.unlock('explorer'); }
    if (pct >= 60  && !window._xp60)  { window._xp60  = true; window._achievements?.unlock('researcher'); }
    if (pct >= 100 && !window._xp100) { window._xp100 = true; window._achievements?.unlock('completionist'); }
  }

  window.addEventListener('scroll', updateXP, { passive: true });

  // ── Section visit tracking for achievements ───────────────
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        if (id === 'research') window._achievements?.unlock('researcher');
        if (id === 'projects') window._achievements?.unlock('project_viewer');
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

})();
