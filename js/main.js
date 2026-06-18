/* ============================================================
   MAIN.JS — Init, navbar, cursor, 3D tilt, chat toggle
   ============================================================ */
(function () {
  'use strict';

  // ── Page loader ────────────────────────────────────────────
  const loader = document.getElementById('pageLoader');
  window.addEventListener('load', () => {
    setTimeout(() => { if (loader) loader.classList.add('loaded'); }, 900);
  });

  // ── Custom cursor ──────────────────────────────────────────
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  const isTouch = window.matchMedia('(hover: none)').matches;
  let dotX = 0, dotY = 0, ringX = 0, ringY = 0;
  let cursorReady = false;

  if (!isTouch && dot && ring) {
    document.addEventListener('mousemove', e => {
      dotX = e.clientX; dotY = e.clientY;
      dot.style.left = dotX + 'px';
      dot.style.top  = dotY + 'px';

      // Only show cursor after first real mouse movement
      if (!cursorReady) {
        cursorReady = true;
        document.body.classList.add('cursor-active');
      }
    });

    (function animRing() {
      ringX += (dotX - ringX) * 0.14;
      ringY += (dotY - ringY) * 0.14;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animRing);
    })();
  } else {
    if (dot)  dot.remove();
    if (ring) ring.remove();
  }

  // ── Navbar scroll ──────────────────────────────────────────
  const navbar = document.getElementById('navbar');

  function onScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    highlightNav();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Active nav ─────────────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const NAV_H    = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 68;

  function highlightNav() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - NAV_H - 80) current = sec.id;
    });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }

  // ── Hamburger ──────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navList   = document.getElementById('navLinks');

  if (hamburger && navList) {
    function toggleMenu(e) {
      e.preventDefault();
      e.stopPropagation();

      const open = !navList.classList.contains('open');

      navList.classList.toggle('open', open);
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    }

    hamburger.addEventListener('click', toggleMenu);
    hamburger.addEventListener('touchend', toggleMenu);

    navList.addEventListener('click', e => {
      e.stopPropagation();
    });

    navList.querySelectorAll('.nav-link').forEach(l => {
      l.addEventListener('click', () => {
        navList.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', () => {
      navList.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  }

  // ── Chat toggle (navbar button AND logo triple click) ──────
  // Chat open/close is handled in chat.js via chatTrigger click
  // We just wire the navbar button to fire chatFab click
  const chatTriggerNav = document.getElementById('chatTrigger');
  if (chatTriggerNav) {
    chatTriggerNav.addEventListener('click', () => {
      document.getElementById('chatFab')?.click();
    });
  }

  // ── Logo triple click easter egg ───────────────────────────
  const navLogo = document.getElementById('navLogo');
  let logoClicks = 0, logoTimer = null;
  if (navLogo) {
    navLogo.addEventListener('click', e => {
      e.preventDefault();
      logoClicks++;
      clearTimeout(logoTimer);
      logoTimer = setTimeout(() => { logoClicks = 0; }, 600);
      if (logoClicks >= 3) {
        logoClicks = 0;
        window._easterEggs?.triggerMatrixRain();
        window._achievements?.unlock('easter_egg');
      }
    });
  }

  // ── 3D card tilt — no translateY, only rotate ─────────────
  function initTilt() {
    document.querySelectorAll('.card-tilt').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const dx   = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
        const dy   = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
        card.style.transform  = `perspective(1000px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg)`;
        card.style.boxShadow  = `${-dx * 8}px ${dy * 8}px 24px rgba(0,0,0,0.10), var(--shadow-accent)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }
  window.addEventListener('load', initTilt);

  // ── Smooth anchor ─────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); window.scrollTo({ top: target.offsetTop - NAV_H + 1, behavior: 'smooth' }); }
    });
  });

})();
