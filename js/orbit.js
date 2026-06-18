/* ============================================================
   ORBIT.JS — JS-driven circular orbit for About section
   All items orbit at the SAME radius, evenly spaced by angle.
   Items counter-rotate so text always stays upright.
   ============================================================ */
(function () {
  'use strict';

  const wrapper = document.getElementById('orbitWrapper');
  if (!wrapper) return;

  const items   = Array.from(wrapper.querySelectorAll('.orbit-item'));
  const count   = items.length;
  const SPEED   = 0.3;          // degrees per frame
  let   angle   = 0;
  let   raf     = null;
  let   paused  = false;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getRadius() {
    const size = wrapper.offsetWidth;
    return size * 0.42;         // 42% of wrapper = tight cluster
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
    raf = requestAnimationFrame(tick);
  }

  // Pause on hover so user can read labels
  wrapper.addEventListener('mouseenter', () => { paused = true; });
  wrapper.addEventListener('mouseleave', () => { paused = false; });

  // Reposition on resize
  window.addEventListener('resize', place);

  // Initial place then animate
  place();
  if (!prefersReduced) {
    tick();
  } else {
    place(); // static placement only
  }

})();