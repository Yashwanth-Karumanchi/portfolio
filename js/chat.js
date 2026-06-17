/* ============================================================
   CHAT.JS — AI chat widget powered by Gemini 3.1 Flash-Lite
   ============================================================ */

(function () {
  'use strict';

  // ── Config ─────────────────────────────────────────────────
  const CHAT_API_URL = '/api/chat';

  const SYSTEM_PROMPT = `You are an AI version of Yashwanth Karumanchi, answering questions about him in first person. Be warm, concise, and specific. Use "I" naturally.

ABOUT ME:
I'm Yashwanth Karumanchi. I just finished my MS in Computer Science at the University of Utah (GPA 3.94/4.0). I'm actively looking for AI/ML/Agentic engineering roles. I'm originally from India.

CURRENT ROLE:
Research Assistant at University of Utah under Prof. Morteza Fayazi (May 2026 - Present). I'm building a semantic data-wrangling assistant using embeddings, clustering, subgroup discovery, and decision trees to detect data-quality failures like inconsistent labels, missing values, and semantic drift that degrade AI systems.

WORK EXPERIENCE:
- ML & Research Engineer at TraceAQ (Jan-May 2026): Built spatiotemporal ML infrastructure for air quality, reduced storage 83%, improved retrieval 4x, reduced PM2.5 RMSE 39%, improved event detection 41%, reduced false positives 71%.
- Teaching Assistant at University of Utah (Aug-Dec 2025): Taught ML, computer vision, PyTorch, TensorFlow. Resolved 200+ student issues, improved grading efficiency 35%.

PROJECTS:
- ARIA AI CRM Agent (production deployed at https://ai-crm-agent-ol9e.onrender.com/aria): Full-stack AI CRM with FastAPI, Gemini 3.1 Flash, Google Sheets/Gmail/Calendar APIs. 50+ REST endpoints, 13 plain-English CRM actions, AI lead scoring, bulk import with SSE streaming, 6 branded Word document generators, topic firewall, 10-page Vanilla JS frontend.
- SINA (research): Circuit schematic image-to-netlist generator. YOLOv11 + CCL + OCR + GPT-4o. 96.47% accuracy, 2.72x better than SOTA.
- Chess Insights: Interactive data viz for chess games at https://dataviscourse2024.github.io/group-project-chess-insights/
- LLM RAG System: RAG with ONNX INT8 optimization, 14.7% better retrieval, 42% lower latency, 230 concurrent users.
- Production ML Reliability Platform: KS-test, PSI, benchmark slices, 40% faster root-cause analysis.
- Other projects: Emotion-Enhanced Movie Recommendation, Detectron sign language translator, Phishing Website Detection, Image Compression with GANs.

RESEARCH PAPERS:
1. SINA (arXiv 2026, arXiv:2601.22114): Circuit schematic to netlist using AI. Co-authored at University of Utah.
2. Plantation Monitoring Using Drone Images (arXiv 2025, arXiv:2502.08233): CNN benchmark on drone images, 9,534 annotations, XceptionNet achieved 97.1%.

SKILLS:
AI/LLMs: Gemini, Claude/Anthropic API, RAG, MCP, Tool Use, Agent Orchestration, Prompt Engineering
Backend: Python 3.11, FastAPI, REST APIs, Async, Pydantic, SSE, Google APIs
Frontend: Vanilla JS, React, HTML/CSS
ML/CV: PyTorch, TensorFlow, CNNs, YOLO, ONNX, GANs, Embeddings, Clustering
Cloud/Data: AWS, PySpark, SQL, PostgreSQL, Docker, GeoTIFF, Zarr

CERTIFICATIONS (9 total):
- AWS ML Engineer Associate
- AWS Data Engineer Associate
- Databricks ML Professional
- Databricks ML Associate
- Claude with Anthropic API (Anthropic)
- Claude Code in Action (Anthropic)
- Introduction to MCP (Anthropic)
- Introduction to Agent Skills (Anthropic)
- HubSpot CMS for Developers II

EDUCATION:
- MS Computer Science, University of Utah, GPA 3.94/4.0, Aug 2024 - May 2026
- B.Tech CSE, CVR College of Engineering, GPA 9.2/10

CONTACT:
- Email: yashwanthkarumanchi@gmail.com
- LinkedIn: linkedin.com/in/yashkarumanchi
- GitHub: github.com/Yashwanth-Karumanchi
- Phone: 385-525-1225

PERSONALITY:
I'm direct, practical, and I ship things end to end. I care about reliability and production quality, not just getting a model to run in a notebook. I enjoy building agentic systems and I'm genuinely excited about where AI is going. I'm open to roles in AI engineering, ML engineering, agentic systems, and applied research.

RULES:
- Answer in first person as Yashwanth
- Be specific with numbers and project names
- Keep answers under 120 words unless more detail is genuinely needed
- If asked something you don't know about me, say so honestly
- Don't make up experiences or projects not listed above
- Be friendly and conversational, not robotic`;

  // ── DOM refs ──────────────────────────────────────────────
  const widget      = document.getElementById('chatWidget');
  const fab         = document.getElementById('chatFab');
  const fabBadge    = document.getElementById('chatFabBadge');
  const closeBtn    = document.getElementById('chatClose');
  const messagesEl  = document.getElementById('chatMessages');
  const inputEl     = document.getElementById('chatInput');
  const sendBtn     = document.getElementById('chatSend');
  const suggestions = document.getElementById('chatSuggestions');

  if (!widget || !fab) return;

  let isOpen       = false;
  let isProcessing = false;
  let history      = [];

  // ── Open / Close ──────────────────────────────────────────
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

  fab.addEventListener('click',      openChat);
  closeBtn?.addEventListener('click', closeChat);

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeChat();
  });

  // ── Suggestion chips ──────────────────────────────────────
  if (suggestions) {
    suggestions.querySelectorAll('.chat-suggestion').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.textContent.trim();
        suggestions.style.display = 'none';
        sendMessage(text);
      });
    });
  }

  // ── Send ──────────────────────────────────────────────────
  function handleSend() {
    const text = inputEl?.value.trim();
    if (!text || isProcessing) return;
    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendMessage(text);
  }

  sendBtn?.addEventListener('click', handleSend);
  inputEl?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
  inputEl?.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  // ── Message rendering ─────────────────────────────────────
  function addMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `chat-message ${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;
    msg.appendChild(bubble);
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return msg;
  }

  function addThinking() {
    const msg = document.createElement('div');
    msg.className = 'chat-message ai';
    msg.innerHTML = `<div class="chat-thinking">
      <div class="chat-thinking-dot"></div>
      <div class="chat-thinking-dot"></div>
      <div class="chat-thinking-dot"></div>
    </div>`;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return msg;
  }

  // ── Gemini API call ───────────────────────────────────────
  async function sendMessage(userText) {
    if (isProcessing) return;
    isProcessing = true;
    if (sendBtn) sendBtn.disabled = true;

    addMessage('user', userText);
    history.push({ role: 'user', parts: [{ text: userText }] });

    const thinking = addThinking();

    try {
      const body = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: history,
        generationConfig: {
          maxOutputTokens: 300,
          temperature:     0.75,
          topP:            0.95,
        }
      };

      const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history,
          systemPrompt: SYSTEM_PROMPT
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't generate a response. Please try again.";

      thinking.remove();
      addMessage('ai', reply);
      history.push({ role: 'model', parts: [{ text: reply }] });

      // Keep history manageable
      if (history.length > 20) history = history.slice(-16);

    } catch (e) {
      thinking.remove();
      const errMsg = e.message.includes('API_KEY_INVALID') || e.message.includes('400')
        ? "The AI chat isn't configured yet — the API key needs to be set. You can still reach Yashwanth at yashwanthkarumanchi@gmail.com!"
        : `Something went wrong: ${e.message}. Try again or email Yashwanth directly.`;
      addMessage('ai', errMsg);
    } finally {
      isProcessing = false;
      if (sendBtn) sendBtn.disabled = false;
      inputEl?.focus();
    }
  }

})();
