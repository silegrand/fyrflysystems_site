/* ============================================================
   FYRFLY SYSTEMS — AI Security Advisor Chat Widget
   Powered by Claude (Anthropic)
   
   Proxy: https://fyrflyagent.icy-heart-14c9.workers.dev
   API key stored securely in Cloudflare Worker environment variables
   
   Usage: Add <script src="/chat.js"></script> to any page
   (already included via footer.js injection)
   ============================================================ */

(function () {
  'use strict';

  const PROXY_URL = 'https://fyrflyagent.icy-heart-14c9.workers.dev';
  const MODEL     = 'claude-sonnet-4-5';

  // ── System prompt ─────────────────────────────────────────
  const SYSTEM_PROMPT = `You are the Fyrfly Security Advisor — a specialist AI assistant for Fyrfly Systems (www.fyrflysystems.com), a UK security company that designs and installs physical security systems exclusively for schools, colleges, and the public sector.

Your expertise covers:
- CCTV systems for schools (NSI NACOSS Gold certified, 4K cameras, AI analytics, UK GDPR compliance)
- Access control (role-based, KCSiE compliant, DBS-aware visitor management)
- Intruder alarm systems (Grade 2 and Grade 3, NSI certified)
- Fire alarm systems (BAFE SP203-1, BS 5839-1 compliant)
- Wireless networks for education and public sector
- 24/7 ARC monitoring
- Solar CCTV towers (rapid deploy, no mains power)
- AI video analytics (loitering, perimeter breach, ANPR, thermal)
- Martyn's Law (Terrorism (Protection of Premises) Act 2025) — enforcement April 2027
- KCSiE (Keeping Children Safe in Education) safeguarding requirements
- UK GDPR and Surveillance Camera Code of Practice
- DfE protective security guidance for schools
- Crown Commercial Service framework procurement
- NSI NACOSS Gold and SSAIB certification

Key facts about Fyrfly Systems:
- Headquartered in Faversham, Kent — serving nationally across the UK
- Holds: NSI NACOSS Gold, SSAIB Approved, BAFE SP203-1, ISO 9001:2015, Constructionline Gold, Crown Commercial Service
- All systems designed to be KCSiE compliant and Martyn's Law ready
- Free tools available: Martyn's Law Assessment (/martyns-law-tool.html), Lockdown Procedure Generator (/lockdown-procedure-tool.html), Cost Estimator (/cost-estimator.html), Zone Planner (/zone-planner.html), Compliance Checker (/compliance-tool.html)
- Contact: hello@fyrflysystems.com | 01234 567 890

Your personality:
- Knowledgeable, direct, and reassuring — like a trusted colleague who happens to be a security expert
- Never salesy or pushy — your job is to genuinely help, and trust that good advice leads to good relationships
- Specific and factual — always reference the actual legislation, standards and guidance
- Honest about what you don't know — if something requires a site survey to answer properly, say so
- Concise on mobile — keep responses to 3-4 sentences where possible, use bullet points for lists

Lead capture behaviour:
- When someone is clearly interested in Fyrfly's services (asking about costs, surveys, specific systems for their school), naturally ask: "To give you the most accurate advice and send you a summary of our conversation, could I take your name and email?"
- Never ask for contact details in the first two messages
- Never ask more than once if they decline

Important:
- You can recommend Fyrfly's free tools when relevant — e.g. "Have you tried our Martyn's Law Assessment? It'll tell you your exact tier and obligations in 5 minutes — it's free at fyrflysystems.com/martyns-law-tool.html"
- For pricing, give indicative ranges only and always recommend a free site survey for accuracy
- For legal compliance questions, give factual information but note that specific legal advice should come from a qualified solicitor
- Enforcement date for Martyn's Law: 1 April 2027
- Standard Tier: 100–799 capacity. Enhanced Tier: 800+ capacity`;

  // ── Conversation history ──────────────────────────────────
  let messages = [];
  let leadCaptured = false;
  let isOpen = false;
  let isTyping = false;

  // ── CSS ───────────────────────────────────────────────────
  const CSS = `
    #fyrfly-chat-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9998;
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #C8102E 0%, #E85D04 52%, #F5A623 100%);
      border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(200,16,46,0.4);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s;
      animation: chatPulse 3s ease-in-out infinite;
    }
    #fyrfly-chat-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 28px rgba(200,16,46,0.55);
      animation: none;
    }
    #fyrfly-chat-btn svg { width: 24px; height: 24px; stroke: #fff; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; transition: opacity 0.2s; }
    #fyrfly-chat-btn .icon-chat { opacity: 1; position: absolute; }
    #fyrfly-chat-btn .icon-close { opacity: 0; position: absolute; }
    #fyrfly-chat-btn.open .icon-chat { opacity: 0; }
    #fyrfly-chat-btn.open .icon-close { opacity: 1; }
    #fyrfly-chat-btn .notif-dot {
      position: absolute; top: 2px; right: 2px; width: 14px; height: 14px;
      background: #fff; border-radius: 50%; border: 2px solid #E85D04;
      font-size: 8px; font-weight: 900; color: #C8102E;
      display: flex; align-items: center; justify-content: center;
      animation: notifPop 0.4s cubic-bezier(0.22,1,0.36,1);
    }
    @keyframes chatPulse {
      0%, 100% { box-shadow: 0 4px 20px rgba(200,16,46,0.4); }
      50% { box-shadow: 0 4px 32px rgba(200,16,46,0.65), 0 0 0 8px rgba(200,16,46,0.08); }
    }
    @keyframes notifPop {
      from { transform: scale(0); } to { transform: scale(1); }
    }

    #fyrfly-chat-panel {
      position: fixed; bottom: 92px; right: 24px; z-index: 9999;
      width: 380px; max-width: calc(100vw - 32px);
      height: 560px; max-height: calc(100vh - 120px);
      background: #fff; border-radius: 20px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
      display: flex; flex-direction: column; overflow: hidden;
      transform: scale(0.92) translateY(16px); opacity: 0;
      transform-origin: bottom right;
      transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease;
      pointer-events: none;
    }
    #fyrfly-chat-panel.open {
      transform: scale(1) translateY(0); opacity: 1; pointer-events: all;
    }

    /* Header */
    .fca-header {
      background: linear-gradient(135deg, #0E0E14 0%, #1B1B24 100%);
      padding: 1rem 1.1rem 0.9rem; display: flex; align-items: center; gap: 0.75rem;
      flex-shrink: 0; position: relative; overflow: hidden;
    }
    .fca-header::after {
      content: ''; position: absolute; top: -40px; right: -40px;
      width: 120px; height: 120px; border-radius: 50%;
      background: radial-gradient(circle, rgba(200,16,46,0.15), transparent 70%);
      pointer-events: none;
    }
    .fca-avatar {
      width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
      background: linear-gradient(135deg, #C8102E 0%, #E85D04 52%, #F5A623 100%);
      display: flex; align-items: center; justify-content: center;
    }
    .fca-avatar svg { width: 20px; height: 20px; stroke: #fff; fill: none; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }
    .fca-header-text { flex: 1; }
    .fca-name { font-family: 'Roboto', sans-serif; font-size: 0.88rem; font-weight: 700; color: #fff; letter-spacing: -0.01em; }
    .fca-status { font-size: 0.72rem; color: rgba(255,255,255,0.45); display: flex; align-items: center; gap: 0.35rem; margin-top: 0.1rem; }
    .fca-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; animation: statusPulse 2s ease-in-out infinite; }
    @keyframes statusPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    .fca-header-badge { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.2rem 0.55rem; background: rgba(200,16,46,0.2); border: 1px solid rgba(200,16,46,0.3); border-radius: 100px; color: rgba(255,120,100,0.9); }

    /* Messages */
    .fca-messages {
      flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;
      scroll-behavior: smooth;
    }
    .fca-messages::-webkit-scrollbar { width: 4px; }
    .fca-messages::-webkit-scrollbar-track { background: transparent; }
    .fca-messages::-webkit-scrollbar-thumb { background: #e6e5e1; border-radius: 2px; }

    .fca-msg { display: flex; gap: 0.5rem; animation: msgIn 0.3s cubic-bezier(0.22,1,0.36,1); }
    @keyframes msgIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    .fca-msg.user { flex-direction: row-reverse; }
    .fca-msg-avatar { width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center; }
    .fca-msg.assistant .fca-msg-avatar { background: linear-gradient(135deg, #C8102E, #E85D04); }
    .fca-msg.assistant .fca-msg-avatar svg { width: 14px; height: 14px; stroke: #fff; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .fca-msg.user .fca-msg-avatar { background: #F5F4F2; }
    .fca-msg.user .fca-msg-avatar svg { width: 14px; height: 14px; stroke: #67677A; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .fca-msg-bubble {
      max-width: 82%; padding: 0.65rem 0.85rem; border-radius: 14px;
      font-family: 'DM Sans', sans-serif; font-size: 0.84rem; line-height: 1.6; color: #0E0E14;
    }
    .fca-msg.assistant .fca-msg-bubble { background: #F5F4F2; border-radius: 14px 14px 14px 4px; }
    .fca-msg.user .fca-msg-bubble { background: linear-gradient(135deg, #C8102E, #E85D04); color: #fff; border-radius: 14px 14px 4px 14px; }
    .fca-msg-bubble a { color: #E85D04; text-decoration: underline; }
    .fca-msg.user .fca-msg-bubble a { color: rgba(255,255,255,0.85); }
    .fca-msg-bubble strong { font-weight: 600; }
    .fca-msg-bubble ul { padding-left: 1.1rem; margin: 0.35rem 0; }
    .fca-msg-bubble li { margin-bottom: 0.2rem; }

    /* Typing indicator */
    .fca-typing { display: flex; gap: 0.5rem; align-items: flex-end; }
    .fca-typing-bubble { background: #F5F4F2; border-radius: 14px 14px 14px 4px; padding: 0.7rem 1rem; display: flex; align-items: center; gap: 4px; }
    .fca-typing-dot { width: 6px; height: 6px; border-radius: 50%; background: #9595A5; animation: typingBounce 1.2s ease-in-out infinite; }
    .fca-typing-dot:nth-child(2) { animation-delay: 0.15s; }
    .fca-typing-dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes typingBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }

    /* Quick replies */
    .fca-quick-replies { display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0 1rem 0.5rem; flex-shrink: 0; }
    .fca-qr { padding: 0.4rem 0.85rem; background: #fff; border: 1.5px solid #E6E5E1; border-radius: 100px; font-size: 0.76rem; font-family: 'DM Sans', sans-serif; color: #67677A; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .fca-qr:hover { border-color: #E85D04; color: #E85D04; background: #FFFBF8; }

    /* Input */
    .fca-input-area { border-top: 1px solid #E6E5E1; padding: 0.75rem; display: flex; gap: 0.5rem; align-items: flex-end; flex-shrink: 0; background: #fff; }
    .fca-input {
      flex: 1; border: 1.5px solid #E6E5E1; border-radius: 12px;
      padding: 0.6rem 0.85rem; font-size: 0.84rem; font-family: 'DM Sans', sans-serif;
      color: #0E0E14; resize: none; outline: none; max-height: 100px;
      transition: border-color 0.2s; line-height: 1.5; background: #FAFAF9;
    }
    .fca-input:focus { border-color: #C8102E; background: #fff; }
    .fca-input::placeholder { color: #9595A5; }
    .fca-send {
      width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
      background: linear-gradient(135deg, #C8102E, #E85D04);
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: opacity 0.2s, transform 0.2s;
    }
    .fca-send:hover { opacity: 0.88; transform: scale(1.05); }
    .fca-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    .fca-send svg { width: 16px; height: 16px; stroke: #fff; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }

    /* Powered by */
    .fca-footer { padding: 0.4rem; text-align: center; border-top: 1px solid #F5F4F2; flex-shrink: 0; }
    .fca-footer-text { font-size: 0.67rem; color: #C5C4C0; font-family: 'DM Sans', sans-serif; }
    .fca-footer-text a { color: #C5C4C0; text-decoration: none; }
    .fca-footer-text a:hover { color: #9595A5; }

    @media (max-width: 480px) {
      #fyrfly-chat-panel { right: 12px; bottom: 84px; width: calc(100vw - 24px); height: calc(100vh - 110px); }
      #fyrfly-chat-btn { right: 16px; bottom: 16px; }
    }
  `;

  // ── Inject styles ─────────────────────────────────────────
  const styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  // ── Build widget HTML ─────────────────────────────────────
  // Button
  const btn = document.createElement('button');
  btn.id = 'fyrfly-chat-btn';
  btn.setAttribute('aria-label', 'Open Fyrfly Security Advisor');
  btn.innerHTML = `
    <svg class="icon-chat" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
    <svg class="icon-close" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    <div class="notif-dot" id="fca-notif">1</div>`;
  document.body.appendChild(btn);

  // Panel
  const panel = document.createElement('div');
  panel.id = 'fyrfly-chat-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Fyrfly Security Advisor');
  panel.innerHTML = `
    <div class="fca-header">
      <div class="fca-avatar"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
      <div class="fca-header-text">
        <div class="fca-name">Fyrfly Security Advisor</div>
        <div class="fca-status"><span class="fca-status-dot"></span>Online — typically replies instantly</div>
      </div>
      <div class="fca-header-badge">AI</div>
    </div>
    <div class="fca-messages" id="fca-messages"></div>
    <div class="fca-quick-replies" id="fca-qr"></div>
    <div class="fca-input-area">
      <textarea class="fca-input" id="fca-input" placeholder="Ask about CCTV, Martyn's Law, access control…" rows="1"></textarea>
      <button class="fca-send" id="fca-send" aria-label="Send message">
        <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
    <div class="fca-footer">
      <span class="fca-footer-text">Powered by <a href="https://www.anthropic.com" target="_blank" rel="noopener">Claude AI</a> · <a href="/legal.html">Privacy</a></span>
    </div>`;
  document.body.appendChild(panel);

  // ── Quick reply sets ──────────────────────────────────────
  const QUICK_REPLIES = {
    initial: [
      "Does Martyn's Law apply to us?",
      "How much does school CCTV cost?",
      "What's a free site survey?",
      "KCSiE and CCTV — what do we need?"
    ],
    after_first: [
      "Tell me about your accreditations",
      "What's the difference between tiers?",
      "Can we use Crown Commercial?",
      "Book a free survey"
    ]
  };

  // ── Helpers ───────────────────────────────────────────────
  function scrollToBottom() {
    const msgs = document.getElementById('fca-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  function formatMessage(text) {
    // Convert markdown-style formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n- /g, '</p><ul><li>')
      .replace(/\n/g, '<br>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }

  function addMessage(role, text) {
    const msgs = document.getElementById('fca-messages');
    const div = document.createElement('div');
    div.className = `fca-msg ${role}`;

    const avatarSvg = role === 'assistant'
      ? '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

    div.innerHTML = `
      <div class="fca-msg-avatar">${avatarSvg}</div>
      <div class="fca-msg-bubble"><p>${formatMessage(text)}</p></div>`;
    msgs.appendChild(div);
    scrollToBottom();
  }

  function showTyping() {
    const msgs = document.getElementById('fca-messages');
    const div = document.createElement('div');
    div.className = 'fca-msg assistant';
    div.id = 'fca-typing';
    div.innerHTML = `
      <div class="fca-msg-avatar"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
      <div class="fca-typing"><div class="fca-typing-bubble"><div class="fca-typing-dot"></div><div class="fca-typing-dot"></div><div class="fca-typing-dot"></div></div></div>`;
    msgs.appendChild(div);
    scrollToBottom();
  }

  function hideTyping() {
    const el = document.getElementById('fca-typing');
    if (el) el.remove();
  }

  function setQuickReplies(set) {
    const qr = document.getElementById('fca-qr');
    qr.innerHTML = '';
    (QUICK_REPLIES[set] || []).forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'fca-qr';
      btn.textContent = q;
      btn.onclick = () => sendMessage(q);
      qr.appendChild(btn);
    });
  }

  function removeNotif() {
    const dot = document.getElementById('fca-notif');
    if (dot) dot.remove();
  }

  // ── Send message ──────────────────────────────────────────
  async function sendMessage(text) {
    const input = document.getElementById('fca-input');
    const sendBtn = document.getElementById('fca-send');
    const msg = (text || input.value).trim();
    if (!msg || isTyping) return;

    // Clear input
    if (!text) input.value = '';
    input.style.height = 'auto';
    document.getElementById('fca-qr').innerHTML = '';

    // Add user message
    addMessage('user', msg);
    messages.push({ role: 'user', content: msg });

    // Check for lead capture opportunity
    if (!leadCaptured && messages.length >= 4) {
      const lcKeywords = ['cost', 'price', 'quote', 'survey', 'install', 'buy', 'get', 'interested', 'help us', 'our school', 'we need'];
      if (lcKeywords.some(k => msg.toLowerCase().includes(k))) {
        // Will be handled naturally by the AI via the system prompt
      }
    }

    // Show typing
    isTyping = true;
    sendBtn.disabled = true;
    showTyping();

    try {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 600,
          system: SYSTEM_PROMPT,
          messages: messages
        })
      });

      const data = await response.json();

      if (data.content && data.content[0] && data.content[0].text) {
        const reply = data.content[0].text;
        hideTyping();
        addMessage('assistant', reply);
        messages.push({ role: 'assistant', content: reply });

        // Show follow-up quick replies after first exchange
        if (messages.length === 2) {
          setQuickReplies('after_first');
        }

        // Lead capture — check if AI asked for contact details
        if (reply.toLowerCase().includes('email') && reply.toLowerCase().includes('name')) {
          leadCaptured = true;
        }
      } else {
        hideTyping();
        addMessage('assistant', "I'm sorry, I couldn't process that just now. Please try again or email us directly at hello@fyrflysystems.com.");
      }
    } catch (err) {
      hideTyping();
      addMessage('assistant', "I'm having trouble connecting right now. Please email us at hello@fyrflysystems.com or call 01234 567 890 and we'll be happy to help.");
    }

    isTyping = false;
    sendBtn.disabled = false;
    input.focus();
  }

  // ── Toggle panel ──────────────────────────────────────────
  function toggleChat() {
    isOpen = !isOpen;
    btn.classList.toggle('open', isOpen);
    panel.classList.toggle('open', isOpen);
    removeNotif();

    if (isOpen && messages.length === 0) {
      // Opening greeting
      setTimeout(() => {
        addMessage('assistant', "Hi! I'm the Fyrfly Security Advisor — a specialist in school and public sector security.\n\nI can help with CCTV, access control, Martyn's Law compliance, intruder alarms, fire systems, or anything else security related. What can I help you with today?");
        messages.push({
          role: 'assistant',
          content: "Hi! I'm the Fyrfly Security Advisor — a specialist in school and public sector security.\n\nI can help with CCTV, access control, Martyn's Law compliance, intruder alarms, fire systems, or anything else security related. What can I help you with today?"
        });
        setQuickReplies('initial');
      }, 300);
    }

    if (isOpen) {
      setTimeout(() => document.getElementById('fca-input').focus(), 400);
    }
  }

  // ── Event listeners ───────────────────────────────────────
  btn.addEventListener('click', toggleChat);

  document.getElementById('fca-send').addEventListener('click', () => sendMessage());

  document.getElementById('fca-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  document.getElementById('fca-input').addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      toggleChat();
    }
  });

  // ── Show notification dot after 8 seconds if not opened ──
  setTimeout(() => {
    if (!isOpen) {
      const dot = document.getElementById('fca-notif');
      if (dot) {
        dot.style.display = 'flex';
        // Subtle pulse to draw attention
        btn.style.animation = 'none';
        btn.style.boxShadow = '0 4px 28px rgba(200,16,46,0.6), 0 0 0 6px rgba(200,16,46,0.12)';
      }
    }
  }, 8000);

}());
