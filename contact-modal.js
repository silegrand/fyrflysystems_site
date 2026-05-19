/**
 * Fyrfly Systems — Contact Modal
 * ─────────────────────────────────────────────────────────────
 * Self-contained. Drop one <script> tag into every page.
 * No dependencies. No global pollution. Completely free.
 *
 * SETUP (one-time, 30 seconds):
 *   1. Upload this file and contact-modal-preview.html to the repo
 *   2. Open the preview page in a browser and submit the form once
 *   3. Check hello@fyrflysystems.com for a verification email from
 *      Formsubmit — click the Activate link
 *   4. Done. Every future submission routes to that inbox for free.
 *
 * No account. No credit card. No monthly limits.
 * Powered by formsubmit.co
 * ─────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/hello@fyrflysystems.com';
  var PHONE         = '01234 567 890'; // ← replace with real number
  var EMAIL         = 'hello@fyrflysystems.com';

  /* ── CSS ──────────────────────────────────────────────────── */
  var CSS = `
    :root {
      --fm-c: #C8102E;
      --fm-o: #E85D04;
      --fm-a: #F5A623;
      --fm-grad: linear-gradient(135deg, #C8102E 0%, #E85D04 52%, #F5A623 100%);
      --fm-dark: #0E0E14;
      --fm-char: #1B1B24;
      --fm-mid:  #67677A;
      --fm-mute: #9595A5;
      --fm-bdr:  #E6E5E1;
      --fm-lt:   #F5F4F2;
      --fm-fh:   'Roboto', sans-serif;
      --fm-fb:   'DM Sans', sans-serif;
      --fm-ease: cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* Overlay */
    #fm-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(14, 14, 20, 0.82);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.28s var(--fm-ease), visibility 0.28s;
    }
    #fm-overlay.fm-open {
      opacity: 1;
      visibility: visible;
    }

    /* Modal card */
    .fm-modal {
      display: flex;
      width: 100%;
      max-width: 840px;
      max-height: 92vh;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 32px 80px rgba(0,0,0,0.45);
      transform: translateY(20px) scale(0.97);
      transition: transform 0.3s var(--fm-ease);
      position: relative;
    }
    #fm-overlay.fm-open .fm-modal {
      transform: translateY(0) scale(1);
    }

    /* Close button */
    .fm-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 10;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: rgba(255,255,255,0.12);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    .fm-close:hover { background: rgba(255,255,255,0.22); }
    .fm-close svg { width: 16px; height: 16px; stroke: #fff; fill: none; stroke-width: 2.5; stroke-linecap: round; }

    /* ── LEFT PANEL ─────────────────────────────────────────── */
    .fm-left {
      width: 280px;
      flex-shrink: 0;
      background: var(--fm-char);
      padding: 2.5rem 2rem 2rem;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    .fm-left-bg {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 80% 20%, rgba(232,93,4,0.18) 0%, transparent 55%),
        radial-gradient(ellipse at 10% 80%, rgba(200,16,46,0.12) 0%, transparent 50%);
      pointer-events: none;
    }
    .fm-left > * { position: relative; z-index: 1; }

    .fm-brand {
      font-family: var(--fm-fh);
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--fm-o);
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .fm-brand::before {
      content: '';
      display: inline-block;
      width: 18px;
      height: 2px;
      background: var(--fm-grad);
      border-radius: 2px;
    }

    .fm-left h2 {
      font-family: var(--fm-fh);
      font-size: 1.25rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.025em;
      line-height: 1.2;
      margin-bottom: 0.85rem;
    }
    .fm-left p {
      font-size: 0.82rem;
      color: rgba(255,255,255,0.45);
      line-height: 1.65;
      font-weight: 300;
      margin-bottom: 2rem;
    }

    /* Steps */
    .fm-steps { display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 2rem; }
    .fm-step { display: flex; align-items: flex-start; gap: 0.75rem; }
    .fm-step-n {
      width: 22px; height: 22px;
      border-radius: 50%;
      background: var(--fm-grad);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--fm-fh);
      font-size: 0.65rem;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .fm-step-txt {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.6);
      line-height: 1.5;
    }

    /* Contact details */
    .fm-contact-details {
      margin-top: auto;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .fm-contact-details a {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.45);
      text-decoration: none;
      transition: color 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .fm-contact-details a:hover { color: rgba(255,255,255,0.8); }
    .fm-contact-details a svg { width: 13px; height: 13px; stroke: var(--fm-o); fill: none; stroke-width: 2; stroke-linecap: round; flex-shrink: 0; }

    .fm-accreds {
      font-size: 0.68rem;
      color: rgba(255,255,255,0.22);
      margin-top: 1rem;
      line-height: 1.6;
    }

    /* ── RIGHT PANEL ────────────────────────────────────────── */
    .fm-right {
      flex: 1;
      background: #fff;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    .fm-form-wrap {
      padding: 2.5rem 2rem 2rem;
      flex: 1;
    }

    .fm-right h3 {
      font-family: var(--fm-fh);
      font-size: 1rem;
      font-weight: 700;
      color: var(--fm-dark);
      letter-spacing: -0.02em;
      margin-bottom: 0.35rem;
    }
    .fm-right-sub {
      font-size: 0.8rem;
      color: var(--fm-mute);
      margin-bottom: 1.75rem;
    }

    /* Form rows */
    .fm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 0.85rem; }
    .fm-row.full { grid-template-columns: 1fr; }

    .fm-field { display: flex; flex-direction: column; gap: 0.3rem; }
    .fm-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--fm-dark);
      letter-spacing: 0.03em;
      font-family: var(--fm-fh);
    }
    .fm-label .fm-req { color: var(--fm-c); margin-left: 2px; }
    .fm-label .fm-opt { color: var(--fm-mute); font-weight: 400; font-size: 0.65rem; margin-left: 3px; }

    .fm-input, .fm-select, .fm-textarea {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border: 1.5px solid var(--fm-bdr);
      border-radius: 8px;
      font-family: var(--fm-fb);
      font-size: 0.88rem;
      color: var(--fm-dark);
      background: var(--fm-lt);
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
      appearance: none;
      -webkit-appearance: none;
    }
    .fm-input:focus, .fm-select:focus, .fm-textarea:focus {
      border-color: var(--fm-o);
      box-shadow: 0 0 0 3px rgba(232, 93, 4, 0.12);
      background: #fff;
    }
    .fm-input.fm-error, .fm-select.fm-error, .fm-textarea.fm-error {
      border-color: var(--fm-c);
      box-shadow: 0 0 0 3px rgba(200, 16, 46, 0.1);
    }
    .fm-err-msg {
      font-size: 0.68rem;
      color: var(--fm-c);
      font-weight: 500;
      display: none;
    }
    .fm-err-msg.show { display: block; }

    .fm-select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpolyline points='6 9 12 15 18 9' stroke='%2367677A' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 14px;
      padding-right: 2.25rem;
      cursor: pointer;
    }

    .fm-textarea { resize: vertical; min-height: 80px; line-height: 1.55; }

    /* Interest pills */
    .fm-pills-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--fm-dark);
      letter-spacing: 0.03em;
      font-family: var(--fm-fh);
      margin-bottom: 0.5rem;
      display: block;
    }
    .fm-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      margin-bottom: 0.85rem;
    }
    .fm-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.35rem 0.85rem;
      border: 1.5px solid var(--fm-bdr);
      border-radius: 100px;
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--fm-mid);
      background: var(--fm-lt);
      cursor: pointer;
      user-select: none;
      transition: border-color 0.18s, color 0.18s, background 0.18s;
    }
    .fm-pill:hover { border-color: #E85D04; color: #E85D04; }
    .fm-pill.selected {
      border-color: var(--fm-o);
      background: rgba(232, 93, 4, 0.07);
      color: var(--fm-o);
      font-weight: 600;
    }
    .fm-pill.selected::before {
      content: '✓';
      font-size: 0.7rem;
    }

    /* Submit button */
    .fm-submit {
      width: 100%;
      padding: 0.9rem;
      background: var(--fm-grad);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-family: var(--fm-fh);
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.2s var(--fm-ease);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1.25rem;
      min-height: 48px;
    }
    .fm-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
    .fm-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Spinner */
    .fm-spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: fm-spin 0.7s linear infinite;
      display: none;
    }
    .fm-submit.loading .fm-spinner { display: block; }
    .fm-submit.loading .fm-btn-text { display: none; }
    @keyframes fm-spin { to { transform: rotate(360deg); } }

    .fm-privacy {
      font-size: 0.68rem;
      color: var(--fm-mute);
      text-align: center;
      margin-top: 0.75rem;
      line-height: 1.5;
    }

    /* ── SUCCESS STATE ──────────────────────────────────────── */
    .fm-success {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 2.5rem;
      flex: 1;
    }
    .fm-success.hidden { display: none; }
    .fm-check {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: var(--fm-grad);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.5rem;
      box-shadow: 0 8px 24px rgba(232,93,4,0.3);
    }
    .fm-check svg { width: 28px; height: 28px; stroke: #fff; fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
    .fm-success h3 {
      font-family: var(--fm-fh);
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--fm-dark);
      letter-spacing: -0.02em;
      margin-bottom: 0.75rem;
    }
    .fm-success p {
      font-size: 0.88rem;
      color: var(--fm-mid);
      line-height: 1.7;
      max-width: 36ch;
      margin: 0 auto 1.5rem;
    }
    .fm-success-close {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.7rem 1.75rem;
      background: var(--fm-grad);
      color: #fff;
      border: none;
      border-radius: 7px;
      font-family: var(--fm-fh);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .fm-success-close:hover { opacity: 0.88; }

    /* ── RESPONSIVE ─────────────────────────────────────────── */
    @media (max-width: 680px) {
      #fm-overlay { align-items: flex-end; padding: 0; }
      .fm-modal {
        flex-direction: column;
        border-radius: 18px 18px 0 0;
        max-height: 95vh;
      }
      .fm-left {
        width: 100%;
        padding: 1.5rem 1.5rem 1.25rem;
      }
      .fm-left p, .fm-steps, .fm-accreds { display: none; }
      .fm-left h2 { font-size: 1rem; margin-bottom: 0; }
      .fm-contact-details { flex-direction: row; gap: 1.25rem; margin-top: 0.75rem; padding-top: 0.75rem; }
      .fm-form-wrap { padding: 1.5rem 1.25rem 2rem; }
      .fm-row { grid-template-columns: 1fr; }
      .fm-close { top: 0.85rem; right: 0.85rem; }
    }
  `;

  /* ── MODAL HTML ───────────────────────────────────────────── */
  function buildModalHTML() {
    return `
      <div id="fm-overlay" role="dialog" aria-modal="true" aria-labelledby="fm-title">
        <div class="fm-modal">

          <button class="fm-close" id="fm-close-btn" aria-label="Close form">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <!-- LEFT PANEL -->
          <div class="fm-left" aria-hidden="true">
            <div class="fm-left-bg"></div>
            <div class="fm-brand">Fyrfly Systems</div>
            <h2 id="fm-title">Request a Free<br>Site Survey</h2>
            <p>Tell us about your site and we'll come to you. No obligation, no sales pressure — just an honest assessment from specialists who understand your sector.</p>

            <div class="fm-steps">
              <div class="fm-step">
                <div class="fm-step-n">1</div>
                <div class="fm-step-txt">We respond within one working day</div>
              </div>
              <div class="fm-step">
                <div class="fm-step-n">2</div>
                <div class="fm-step-txt">A free site visit at your convenience</div>
              </div>
              <div class="fm-step">
                <div class="fm-step-n">3</div>
                <div class="fm-step-txt">A written proposal with no obligation to proceed</div>
              </div>
            </div>

            <div class="fm-contact-details">
              <a href="tel:${PHONE.replace(/\s/g,'')}">
                <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.35 9.8 19.79 19.79 0 01.25 1.17 2 2 0 012.24 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                ${PHONE}
              </a>
              <a href="mailto:${EMAIL}">
                <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                ${EMAIL}
              </a>
            </div>

            <div class="fm-accreds">NSI NACOSS Gold &bull; SSAIB Approved &bull; BAFE Registered &bull; ISO 9001:2015</div>
          </div>

          <!-- RIGHT PANEL -->
          <div class="fm-right">

            <!-- FORM -->
            <div class="fm-form-wrap" id="fm-form-wrap">
              <h3>Get in Touch</h3>
              <p class="fm-right-sub">Complete the form and our team will be back with you within one working day.</p>

              <form id="fm-form" novalidate>

                <div class="fm-row">
                  <div class="fm-field">
                    <label class="fm-label" for="fm-name">Full name<span class="fm-req">*</span></label>
                    <input class="fm-input" type="text" id="fm-name" name="name" placeholder="Jane Smith" autocomplete="name" required>
                    <span class="fm-err-msg" id="fm-name-err">Please enter your name</span>
                  </div>
                  <div class="fm-field">
                    <label class="fm-label" for="fm-org">Organisation<span class="fm-req">*</span></label>
                    <input class="fm-input" type="text" id="fm-org" name="organisation" placeholder="School or council name" required>
                    <span class="fm-err-msg" id="fm-org-err">Please enter your organisation</span>
                  </div>
                </div>

                <div class="fm-row">
                  <div class="fm-field">
                    <label class="fm-label" for="fm-email">Email address<span class="fm-req">*</span></label>
                    <input class="fm-input" type="email" id="fm-email" name="email" placeholder="jane@school.ac.uk" autocomplete="email" required>
                    <span class="fm-err-msg" id="fm-email-err">Please enter a valid email address</span>
                  </div>
                  <div class="fm-field">
                    <label class="fm-label" for="fm-phone">Phone<span class="fm-opt">(optional)</span></label>
                    <input class="fm-input" type="tel" id="fm-phone" name="phone" placeholder="01234 567 890" autocomplete="tel">
                  </div>
                </div>

                <div class="fm-row full">
                  <div class="fm-field">
                    <label class="fm-label" for="fm-role">Your role<span class="fm-opt">(optional)</span></label>
                    <select class="fm-select" id="fm-role" name="role">
                      <option value="">Select your role…</option>
                      <option>Headteacher / Principal</option>
                      <option>Deputy Headteacher</option>
                      <option>Business Manager</option>
                      <option>Facilities Manager</option>
                      <option>Governor / Trustee</option>
                      <option>IT Manager</option>
                      <option>Designated Safeguarding Lead</option>
                      <option>Council Officer</option>
                      <option>Procurement Manager</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <span class="fm-pills-label">I'm interested in<span style="color:var(--fm-mute);font-weight:400;font-size:0.65rem;margin-left:3px">(select all that apply)</span></span>
                  <div class="fm-pills" id="fm-pills">
                    <div class="fm-pill" data-value="CCTV">CCTV</div>
                    <div class="fm-pill" data-value="Access Control">Access Control</div>
                    <div class="fm-pill" data-value="Intruder Alarms">Intruder Alarms</div>
                    <div class="fm-pill" data-value="Fire Systems">Fire Systems</div>
                    <div class="fm-pill" data-value="Wireless Networks">Wireless Networks</div>
                    <div class="fm-pill" data-value="Full Site Survey">Full Site Survey</div>
                  </div>
                  <input type="hidden" id="fm-interests" name="interests">
                </div>

                <div class="fm-row full">
                  <div class="fm-field">
                    <label class="fm-label" for="fm-message">Tell us about your site<span class="fm-opt">(optional)</span></label>
                    <textarea class="fm-textarea" id="fm-message" name="message" placeholder="Number of buildings, specific concerns, current systems, anything useful…"></textarea>
                  </div>
                </div>

                <button class="fm-submit" id="fm-submit" type="submit">
                  <span class="fm-btn-text">Send Enquiry &rarr;</span>
                  <div class="fm-spinner"></div>
                </button>

                <p class="fm-privacy">Your details are handled in accordance with our <a href="/privacy-policy.html" style="color:var(--fm-o)">Privacy Policy</a> and used only to respond to your enquiry.</p>

              </form>
            </div>

            <!-- SUCCESS -->
            <div class="fm-success hidden" id="fm-success">
              <div class="fm-check">
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 id="fm-success-name">Thank you!</h3>
              <p>Your enquiry has been sent to the Fyrfly team. We'll be in touch within one working day. If you need to speak to someone sooner, call us on <a href="tel:${PHONE.replace(/\s/g,'')}" style="color:var(--fm-o);text-decoration:none">${PHONE}</a>.</p>
              <button class="fm-success-close" id="fm-success-btn">Close</button>
            </div>

          </div><!-- /fm-right -->

        </div><!-- /fm-modal -->
      </div><!-- /fm-overlay -->
    `;
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  function init() {

    // Inject CSS
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    // Inject HTML
    var container = document.createElement('div');
    container.innerHTML = buildModalHTML();
    document.body.appendChild(container);

    var overlay  = document.getElementById('fm-overlay');
    var form     = document.getElementById('fm-form');
    var formWrap = document.getElementById('fm-form-wrap');
    var success  = document.getElementById('fm-success');
    var submitBtn = document.getElementById('fm-submit');
    var pills    = document.querySelectorAll('.fm-pill');
    var interestsInput = document.getElementById('fm-interests');
    var lastTrigger = null;

    // ── Open / Close ───────────────────────────────────────────
    function openModal(source) {
      lastTrigger = source || null;
      overlay.classList.add('fm-open');
      document.body.style.overflow = 'hidden';
      // Reset to form view
      formWrap.style.display = '';
      success.classList.add('hidden');
      // Focus first input
      setTimeout(function() {
        var first = form.querySelector('input:not([type=hidden]):not([style*=none])');
        if (first) first.focus();
      }, 300);
    }

    function closeModal() {
      overlay.classList.remove('fm-open');
      document.body.style.overflow = '';
      if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
    }

    // ── Trigger detection ──────────────────────────────────────
    // Intercept: mailto links, #contact anchors used as CTAs, .nav-cta, .contact-trigger
    var selectors = [
      'a[href*="mailto:' + EMAIL + '"]',
      '.contact-trigger',
      '[data-contact-form]'
    ];

    function attachTriggers() {
      var elements = document.querySelectorAll(selectors.join(', '));
      elements.forEach(function(el) {
        // Skip footer plain email link (it's in <p> / .ft-links and small)
        var inFooter = el.closest('footer');
        var isSmall  = el.tagName === 'A' && !el.classList.contains('btn-p') &&
                       !el.classList.contains('nav-cta') && !el.classList.contains('btn-export') &&
                       !el.classList.contains('btn-s') && !el.classList.contains('contact-trigger');
        if (inFooter && isSmall) return; // let footer email link stay as-is

        el.addEventListener('click', function(e) {
          e.preventDefault();
          openModal(el);
        });
      });
    }
    attachTriggers();

    // ── Close handlers ─────────────────────────────────────────
    document.getElementById('fm-close-btn').addEventListener('click', closeModal);
    document.getElementById('fm-success-btn').addEventListener('click', closeModal);

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('fm-open')) closeModal();
    });

    // ── Interest pills ─────────────────────────────────────────
    pills.forEach(function(pill) {
      pill.addEventListener('click', function() {
        pill.classList.toggle('selected');
        var selected = Array.from(pills)
          .filter(function(p) { return p.classList.contains('selected'); })
          .map(function(p) { return p.dataset.value; });
        interestsInput.value = selected.join(', ');
      });
    });

    // ── Validation ─────────────────────────────────────────────
    function setError(inputId, errId, show) {
      var input = document.getElementById(inputId);
      var err   = document.getElementById(errId);
      if (show) {
        input.classList.add('fm-error');
        err.classList.add('show');
      } else {
        input.classList.remove('fm-error');
        err.classList.remove('show');
      }
      return !show;
    }

    function validate() {
      var name  = document.getElementById('fm-name').value.trim();
      var org   = document.getElementById('fm-org').value.trim();
      var email = document.getElementById('fm-email').value.trim();
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      var n = setError('fm-name',  'fm-name-err',  !name);
      var o = setError('fm-org',   'fm-org-err',   !org);
      var e = setError('fm-email', 'fm-email-err', !emailOk);

      return n && o && e;
    }

    // Clear error on input
    ['fm-name', 'fm-org', 'fm-email'].forEach(function(id) {
      document.getElementById(id).addEventListener('input', function() {
        this.classList.remove('fm-error');
        var errEl = document.getElementById(id + '-err');
        if (errEl) errEl.classList.remove('show');
      });
    });

    // ── Form submission ────────────────────────────────────────
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (!validate()) return;

      // Build JSON payload for Formsubmit
      var firstName = document.getElementById('fm-name').value.trim().split(' ')[0];
      var payload = {
        name:         document.getElementById('fm-name').value.trim(),
        organisation: document.getElementById('fm-org').value.trim(),
        email:        document.getElementById('fm-email').value.trim(),
        phone:        document.getElementById('fm-phone').value.trim() || 'Not provided',
        role:         document.getElementById('fm-role').value         || 'Not specified',
        interests:    interestsInput.value                             || 'Not specified',
        message:      document.getElementById('fm-message').value.trim() || 'No message',
        _subject:     'New enquiry — ' + document.getElementById('fm-org').value.trim(),
        _captcha:     'false',
        _template:    'table',
        _replyto:     document.getElementById('fm-email').value.trim()
      };

      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      fetch(FORM_ENDPOINT, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept':        'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        if (data.success === 'true' || data.success === true) {
          showSuccess(firstName);
          form.reset();
          pills.forEach(function(p) { p.classList.remove('selected'); });
          interestsInput.value = '';
        } else {
          alert('Something went wrong. Please email us directly at ' + EMAIL);
        }
      })
      .catch(function() {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        alert('Could not send the form. Please email us directly at ' + EMAIL);
      });
    });

    function showSuccess(firstName) {
      formWrap.style.display = 'none';
      success.classList.remove('hidden');
      var nameEl = document.getElementById('fm-success-name');
      nameEl.textContent = firstName ? 'Thank you, ' + firstName + '!' : 'Thank you!';
    }

  } // end init

  /* ── BOOT ─────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
