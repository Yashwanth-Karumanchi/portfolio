/* ============================================================
   MAIN.JS — Init, navbar scroll behavior, custom cursor,
             page loader, mobile menu, active nav highlighting
   ============================================================ */

(function () {
  'use strict';

  // ── Page loader ───────────────────────────────────────────
  const loader = document.getElementById('pageLoader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (loader) loader.classList.add('loaded');
    }, 900);
  });

  // ── Custom cursor ─────────────────────────────────────────
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let   ringX = 0, ringY = 0;
  let   dotX  = 0, dotY  = 0;

  const isTouchDevice = window.matchMedia('(hover: none)').matches;

  if (!isTouchDevice && dot && ring) {
    document.addEventListener('mousemove', e => {
      dotX = e.clientX;
      dotY = e.clientY;
      dot.style.left = dotX + 'px';
      dot.style.top  = dotY + 'px';
    });

    // Ring lags slightly behind
    function animateRing() {
      ringX += (dotX - ringX) * 0.14;
      ringY += (dotY - ringY) * 0.14;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Expand ring on interactive elements
    const interactives = 'a, button, .skill-tag, .project-card, .cert-card';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(interactives)) {
        ring.style.width  = '44px';
        ring.style.height = '44px';
        ring.style.opacity = '0.5';
        dot.style.opacity  = '0';
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(interactives)) {
        ring.style.width  = '32px';
        ring.style.height = '32px';
        ring.style.opacity = '0.7';
        dot.style.opacity  = '0.7';
      }
    });
  } else {
    // Remove cursor elements on touch devices
    if (dot)  dot.remove();
    if (ring) ring.remove();
  }

  // ── Navbar scroll behavior ────────────────────────────────
  const navbar = document.getElementById('navbar');

  function onScroll() {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightNavLinkFixed();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Active nav link on scroll ─────────────────────────────
  const sections  = document.querySelectorAll('section[id], div[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  // Fix: CSS variable in JS
  function navHeight() {
    return parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-height')
    ) || 68;
  }

  function highlightNavLinkFixed() {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - navHeight() - 80;
      if (window.scrollY >= top) {
        current = sec.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', highlightNavLinkFixed, { passive: true });

  // ── Mobile hamburger ──────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navList   = document.getElementById('navLinks');

  if (hamburger && navList) {
    hamburger.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close on nav link click
    navList.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navList.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        navList.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Chat widget trigger (navbar button) ───────────────────
  const chatTriggerNav = document.getElementById('chatTrigger');
  if (chatTriggerNav) {
    chatTriggerNav.addEventListener('click', () => {
      // Delegate to chat.js
      const fab = document.getElementById('chatFab');
      if (fab) fab.click();
    });
  }

  // ── 3D card tilt on mouse move ────────────────────────────
  function initTilt() {
    document.querySelectorAll('.card-tilt').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) / (rect.width  / 2);
        const dy     = (e.clientY - cy) / (rect.height / 2);
        const rotX   = -dy * 6;
        const rotY   =  dx * 6;
        card.style.transform =
          `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
        card.style.boxShadow = `
          ${-rotY * 2}px ${rotX * 2}px 30px rgba(0,0,0,0.10),
          var(--shadow-accent)
        `;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform  = '';
        card.style.boxShadow  = '';
      });
    });
  }

  // Init tilt after page loads
  window.addEventListener('load', initTilt);

  // ── Smooth anchor scroll ──────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.offsetTop - navHeight() + 1;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Expose helpers globally ───────────────────────────────
  window._portfolioUtils = { navHeight };

})();
