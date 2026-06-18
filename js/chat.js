/* ============================================================
   CHAT.JS — AI chat via /api/chat (Vercel serverless proxy)
   ============================================================ */
(function () {
  'use strict';

  const CHAT_API_URL = '/api/chat';

  const SYSTEM_PROMPT = `You are an AI version of Yashwanth Karumanchi answering questions in first person. Be warm, concise, specific. Use "I" naturally. Keep answers under 120 words unless more detail is genuinely needed.

IDENTITY: Yashwanth Karumanchi. Machine Learning Engineer. MS Computer Science, University of Utah (GPA 3.94/4.0). Looking for AI/ML/Agentic/Data Engineering roles. Originally from India, based in Salt Lake City UT.

EXPERIENCE:
1. Research Assistant, Univ of Utah (May 2026-Present, Prof. Morteza Fayazi): Semantic no-code data wrangling assistant using SentenceTransformers, HDBSCAN, subgroup discovery, decision trees.
2. ML & Research Engineer, TraceAQ (Jan-May 2026): Zarr datastore cut storage 83%, retrieval 4x faster. Semi-supervised PM2.5 prediction RMSE -39%, event detection +41%. Model 66% better than physics baseline, false positives -71%.
3. Research Assistant SINA, Univ of Utah (Apr-Aug 2025): Built SINA CV pipeline YOLOv11+CCL+OCR+GPT-4o. 96.47% accuracy, 2.7x better than SOTA. GPU usage -60%, training time -50%.
4. Teaching Assistant, Univ of Utah (Aug-Dec 2025): 200+ student issues resolved. Grading +35%, env failures -30%.
5. ML Engineer, Watershed Support Services (Jul-Oct 2023): Crop health detection 40% to 89% mAP. PySpark pipelines 5x faster.

PROJECTS: ARIA AI CRM (live at https://ai-crm-agent-ol9e.onrender.com/aria, 50+ endpoints, 13 AI actions, 3 Google APIs), NBA Conversational AI (RAG+ONNX, 230 concurrent users, latency -42%), Production MLOps Platform (KS-test/PSI/SHAP/MLflow, RCA -40%), HC18 Medical Segmentation (nnU-Net, Dice 0.74), Distributed Data Processing Engine (github.com/Yashwanth-Karumanchi/Automated-Data-Cleaning-Pipeline-for-ML, 20GB in ~2min, accuracy +20%), Multi-Agent QA Generation, Chess Insights (live at dataviscourse2024.github.io/group-project-chess-insights/), Emotion Movie RecSys, Image Compression GAN, Phishing Website Detection (github.com/Yashwanth-Karumanchi/Phishing-Website-Detection), Detectron Sign Language Translator (github.com/Yashwanth-Karumanchi/Detectron--A-user-friendly-sign-language-translator), Face AI Prototype (github.com/Yashwanth-Karumanchi/Face-AI-Prototype).

PAPERS: SINA arXiv:2601.22114 (2026), Plantation Monitoring arXiv:2502.08233 (2025, 9534 annotations, 7 CNNs).

SKILLS: ML, DL, RL, Agentic AI, LLMs, RAG, MCP, CV, MLOps, Data Engineering, FastAPI, PySpark, AWS, GCP, Docker, PostgreSQL, React, Vanilla JS, and more.

CERTS: AWS ML Associate, AWS Data Engineer, Databricks ML Professional, Databricks ML Associate, Claude/Anthropic API, Claude Code, MCP, Agent Skills, HubSpot CMS.

ACHIEVEMENTS: Quad Speed Skating national level 7 years, Smart India Hackathon 2nd place, TNCC Sergeant, Basketball Captain 3 championships, School President 2000+ students.

CONTACT: yashwanthkarumanchi@gmail.com | 385-525-1225 | linkedin.com/in/yashkarumanchi | github.com/Yashwanth-Karumanchi

FORMAT RULES:
- Do not use markdown.
- Do not use **bold**, # headings, bullet markdown, or code blocks.
- Write in clean plain text suitable for a website chat widget.
- Use short paragraphs and line breaks instead.

RULES: First person always. Specific numbers. Honest about what you don't know. Friendly not robotic.`;

  const widget     = document.getElementById('chatWidget');
  const fab        = document.getElementById('chatFab');
  const fabBadge   = document.getElementById('chatFabBadge');
  const closeBtn   = document.getElementById('chatClose');
  const messagesEl = document.getElementById('chatMessages');
  const inputEl    = document.getElementById('chatInput');
  const sendBtn    = document.getElementById('chatSend');
  const suggestions= document.getElementById('chatSuggestions');

  if (!widget || !fab) return;

  let isOpen = false, isProcessing = false;
  let history = [];

  function openChat() {
    isOpen = true;
    widget.classList.add('open');
    widget.setAttribute('aria-hidden', 'false');
    if (fabBadge) fabBadge.classList.add('hidden');
    inputEl?.focus();
    window._achievements?.unlock('chat_opened');
  }

  function closeChat() {
    isOpen = false;
    widget.classList.remove('open');
    widget.setAttribute('aria-hidden', 'true');
  }

  function toggleChat() { isOpen ? closeChat() : openChat(); }

  fab.addEventListener('click', toggleChat);
  closeBtn?.addEventListener('click', closeChat);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closeChat(); });

  if (suggestions) {
    suggestions.querySelectorAll('.chat-suggestion').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.textContent.trim();
        suggestions.style.display = 'none';
        sendMessage(text);
      });
    });
  }

  function handleSend() {
    const text = inputEl?.value.trim();
    if (!text || isProcessing) return;
    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendMessage(text);
  }

  sendBtn?.addEventListener('click', handleSend);
  inputEl?.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });
  inputEl?.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 100) + 'px'; });

  function addMessage(role, text) {
    const msg    = document.createElement('div');
    msg.className = `chat-message ${role}`;
    const bubble  = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;
    msg.appendChild(bubble);
    messagesEl.appendChild(msg);
    // Smooth scroll
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
    return msg;
  }

  function addThinking() {
    const msg = document.createElement('div');
    msg.className = 'chat-message ai';
    msg.innerHTML = `<div class="chat-thinking"><div class="chat-thinking-dot"></div><div class="chat-thinking-dot"></div><div class="chat-thinking-dot"></div></div>`;
    messagesEl.appendChild(msg);
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
    return msg;
  }

  async function sendMessage(userText) {
    if (isProcessing) return;
    isProcessing = true;
    if (sendBtn) sendBtn.disabled = true;

    addMessage('user', userText);
    history.push({ role: 'user', parts: [{ text: userText }] });
    const thinking = addThinking();

    try {
      const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, systemPrompt: SYSTEM_PROMPT })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `HTTP ${res.status}`);
      }

      const data  = await res.json();
      const reply = data.reply || "Sorry, I could not generate a response. Try again!";
      thinking.remove();
      addMessage('ai', reply);
      history.push({ role: 'model', parts: [{ text: reply }] });
      if (history.length > 20) history = history.slice(-16);

    } catch (e) {
      thinking.remove();
      addMessage('ai', `Something went wrong: ${e.message}. Try emailing Yashwanth at yashwanthkarumanchi@gmail.com`);
    } finally {
      isProcessing = false;
      if (sendBtn) sendBtn.disabled = false;
      inputEl?.focus();
    }
  }
})();