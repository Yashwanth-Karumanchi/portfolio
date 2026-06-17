/* ============================================================
   ACHIEVEMENTS.JS — Gamification badge unlock system
   ============================================================ */

(function () {
  'use strict';

  const container  = document.getElementById('achievementsContainer');
  const unlocked   = new Set(
    JSON.parse(localStorage.getItem('yk_achievements') || '[]')
  );

  const ACHIEVEMENTS = {
    first_visit:    { icon: '👋', title: 'First Contact',       desc: 'Welcome to the portfolio!' },
    project_viewer: { icon: '🚀', title: 'Project Explorer',    desc: 'Checked out the projects' },
    researcher:     { icon: '📄', title: 'Deep Thinker',        desc: 'Made it to the research section' },
    explorer:       { icon: '🗺️', title: 'Explorer',            desc: '25% of the portfolio explored' },
    completionist:  { icon: '🏆', title: 'Completionist',       desc: 'Read everything — impressive!' },
    chat_opened:    { icon: '🤖', title: 'AI Curious',          desc: 'Started a chat with AI Yashwanth' },
    easter_egg:     { icon: '🥚', title: 'Easter Egg Hunter',   desc: 'Found the hidden secret' },
    konami:         { icon: '🎮', title: 'Gamer',               desc: 'The Konami code? Really?' },
  };

  function show(data) {
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <div class="achievement-icon">${data.icon}</div>
      <div class="achievement-body">
        <div class="achievement-label">Achievement Unlocked</div>
        <div class="achievement-title">${data.title}</div>
        <div class="achievement-desc">${data.desc}</div>
      </div>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4200);
  }

  function unlock(id) {
    if (unlocked.has(id) || !ACHIEVEMENTS[id]) return;
    unlocked.add(id);
    localStorage.setItem('yk_achievements', JSON.stringify([...unlocked]));
    show(ACHIEVEMENTS[id]);
  }

  // First visit
  setTimeout(() => unlock('first_visit'), 1800);

  // Expose globally for other modules
  window._achievements = { unlock };

})();
