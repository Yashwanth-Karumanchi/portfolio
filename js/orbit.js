/* ============================================================
   ORBIT.JS — JS-driven circular orbit for About section
   ============================================================ */
(function () {
  'use strict';

  const wrapper = document.getElementById('orbitWrapper');
  if (!wrapper) return;

  const items   = Array.from(wrapper.querySelectorAll('.orbit-item'));
  const count   = items.length;
  const SPEED   = 0.3;
  let   angle   = 0;
  let   paused  = false;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NAV_H   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 68;

  // Make each orbit item scroll to #skills on click
  items.forEach(item => {
    item.style.cursor = 'pointer';
    item.setAttribute('role', 'link');
    item.setAttribute('tabindex', '0');
    item.addEventListener('click', () => {
      const target = document.getElementById('skills');
      if (target) window.scrollTo({ top: target.offsetTop - NAV_H, behavior: 'smooth' });
    });
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const target = document.getElementById('skills');
        if (target) window.scrollTo({ top: target.offsetTop - NAV_H, behavior: 'smooth' });
      }
    });
  });

  // Make YK center scroll to #about
  const center = wrapper.querySelector('.orbit-center');
  if (center) {
    center.style.cursor = 'pointer';
    center.setAttribute('role', 'link');
    center.setAttribute('tabindex', '0');
    center.addEventListener('click', () => {
      const target = document.getElementById('about');
      if (target) window.scrollTo({ top: target.offsetTop - NAV_H, behavior: 'smooth' });
    });
    center.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const target = document.getElementById('about');
        if (target) window.scrollTo({ top: target.offsetTop - NAV_H, behavior: 'smooth' });
      }
    });
  }

  function getRadius() {
    return wrapper.offsetWidth * 0.42;
  }

  function place() {
    const cx = wrapper.offsetWidth  / 2;
    const cy = wrapper.offsetHeight / 2;
    const r  = getRadius();

    items.forEach((item, i) => {
      const deg = angle + (360 / count) * i;
      const rad = (deg * Math.PI) / 180;
      const x   = cx + r * Math.cos(rad);
      const y   = cy + r * Math.sin(rad);
      item.style.left = x + 'px';
      item.style.top  = y + 'px';
    });
  }

  function tick() {
    if (!paused && !prefersReduced) {
      angle = (angle + SPEED) % 360;
      place();
    }
    requestAnimationFrame(tick);
  }

  wrapper.addEventListener('mouseenter', () => { paused = true; });
  wrapper.addEventListener('mouseleave', () => { paused = false; });
  window.addEventListener('resize', place);

  place();
  if (!prefersReduced) tick();

})();