/* ============================================================
   VISITOR.JS — Live visitor counter via countapi.xyz
   ============================================================ */

(function () {
  'use strict';

  const el = document.getElementById('visitorCount');
  if (!el) return;

  // Uses countapi.xyz free tier — no signup needed
  // Namespace: yashwanth-portfolio, key: visits
  const URL = 'https://api.countapi.xyz/hit/yashwanth-portfolio/visits';

  async function fetchCount() {
    try {
      const res  = await fetch(URL);
      const data = await res.json();
      if (data && data.value) {
        animateCount(data.value);
      }
    } catch {
      // Fallback: show nothing rather than error
      el.textContent = '✦';
    }
  }

  function animateCount(target) {
    const start    = Math.max(1, target - 12);
    const duration = 900;
    const begin    = performance.now();

    function tick(now) {
      const t   = Math.min((now - begin) / duration, 1);
      const val = Math.floor(start + (target - start) * t);
      el.textContent = `#${val.toLocaleString()}`;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = `#${target.toLocaleString()}`;
    }

    requestAnimationFrame(tick);
  }

  fetchCount();

})();
