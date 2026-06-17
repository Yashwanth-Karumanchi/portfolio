/* ============================================================
   COUNTERS.JS — Animated number counters for stats section
   ============================================================ */

(function () {
  'use strict';

  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.target);
    const suffix   = el.dataset.suffix || '';
    const duration = 1600;
    const start    = performance.now();
    const isFloat  = target % 1 !== 0;

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutQuart(progress);
      const value    = target * eased;

      el.textContent = (isFloat
        ? value.toFixed(2)
        : Math.floor(value).toLocaleString()) + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = (isFloat
          ? target.toFixed(2)
          : target.toLocaleString()) + suffix;
      }
    }

    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(el => observer.observe(el));

})();
