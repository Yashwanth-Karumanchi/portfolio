/* ============================================================
   TYPEWRITER.JS — Hero name typewriter + role word rotator
   ============================================================ */

(function () {
  'use strict';

  // ── Typewriter ────────────────────────────────────────────
  const nameEl   = document.querySelector('.hero-name-text');
  const cursorEl = document.querySelector('.hero-cursor');
  const fullName = 'Yashwanth Karumanchi';

  if (!nameEl || !cursorEl) return;

  let charIndex   = 0;
  let typingDone  = false;
  const typingDelay    = 60;   // ms per character
  const startDelay     = 800;  // ms before typing begins

  function typeChar() {
    if (charIndex < fullName.length) {
      nameEl.textContent += fullName[charIndex];
      charIndex++;
      setTimeout(typeChar, typingDelay + Math.random() * 30);
    } else {
      typingDone = true;
      // Cursor blinks a few times then disappears
      setTimeout(() => {
        if (cursorEl) cursorEl.classList.add('done');
      }, 1600);
    }
  }

  setTimeout(typeChar, startDelay);

  // ── Role word rotator ─────────────────────────────────────
  const wordsEl    = document.getElementById('roleWords');
  if (!wordsEl) return;

  const words      = Array.from(wordsEl.querySelectorAll('.hero-role-word'));
  let   current    = 0;
  const rotateDelay = 2800; // ms per word

  function rotateWord() {
    const prev = words[current];
    current    = (current + 1) % words.length;
    const next = words[current];

    // Exit current
    prev.classList.remove('active');
    prev.classList.add('exit');
    setTimeout(() => prev.classList.remove('exit'), 400);

    // Enter next
    next.classList.add('active');
  }

  // Start rotating after name is likely done
  setTimeout(() => {
    setInterval(rotateWord, rotateDelay);
  }, startDelay + fullName.length * typingDelay + 1200);

})();
