/* ============================================================
   FYRFLY SYSTEMS — fyrfly.js
   Combined bundle: nav.js + contact-modal.js + footer.js
   One request. Deferred. No blocking.
   Built: 2026-05-25
   ============================================================ */

/* ── NAV ───────────────────────────────────────────────── */

/* ============================================================
   FYRFLY SYSTEMS — SHARED NAVIGATION
   Edit this file to update the nav on every page at once.
   ============================================================ */

(function () {

  // ── CSS ──────────────────────────────────────────────────────
  const CSS = `
    :root {
      --c:#C8102E; --o:#E85D04; --a:#F5A623;
      --grad:linear-gradient(135deg,#C8102E 0%,#E85D04 52%,#F5A623 100%);
      --dark:#0E0E14; --mid:#67677A; --mute:#9595A5;
      --light:#F5F4F2; --bdr:#E6E5E1; --white:#FFFFFF;
      --fh:'Roboto',sans-serif; --fb:'DM Sans',sans-serif;
      --max:1200px; --nh:70px; --ease:cubic-bezier(0.22,1,0.36,1);
    }
    nav {
      position:sticky; top:0; z-index:200; height:var(--nh);
      background:rgba(255,255,255,0.96); backdrop-filter:blur(14px);
      border-bottom:1px solid var(--bdr); transition:box-shadow 0.3s var(--ease);
    }
    nav.scrolled { box-shadow:0 2px 28px rgba(0,0,0,0.07); }
    .nav-i {
      max-width:var(--max); margin:0 auto; padding:0 2rem;
      height:100%; display:flex; align-items:center;
      justify-content:space-between; gap:2rem;
    }
    .nav-logo { display:flex; align-items:center; flex-shrink:0; }
    .nav-logo img { height:50px; width:auto; }
    .nav-links { display:flex; align-items:center; gap:2rem; list-style:none; }
    .nav-links a { font-size:0.875rem; font-weight:500; color:var(--mid); letter-spacing:0.01em; transition:color 0.2s; }
    .nav-links a:hover, .nav-links a.active { color:var(--dark); }

    /* Dropdowns */
    .nav-dropdown { position:relative; }
    .nav-dropdown > a { display:flex; align-items:center; gap:0.3rem; cursor:pointer; }
    .nav-dropdown > a svg.chev { width:11px; height:11px; stroke:var(--mid); fill:none; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round; transition:transform 0.2s; }
    .nav-dropdown:hover > a svg.chev { transform:rotate(180deg); stroke:var(--dark); }
    .nav-dropdown:hover > a { color:var(--dark); }
    .drop-menu {
      position:absolute; top:calc(100% + 8px); left:50%;
      transform:translateX(-50%) translateY(4px);
      background:#fff; border:1px solid var(--bdr); border-radius:12px;
      box-shadow:0 16px 48px rgba(0,0,0,0.1); padding:0.6rem; min-width:220px;
      opacity:0; visibility:hidden; pointer-events:none;
      transition:opacity 0.18s var(--ease), transform 0.18s var(--ease), visibility 0s linear 0.18s;
    }
    .drop-menu::after { content:''; position:absolute; top:-14px; left:0; right:0; height:14px; }
    .drop-menu::before {
      content:''; position:absolute; top:-6px; left:50%; transform:translateX(-50%);
      width:12px; height:12px; background:#fff;
      border-left:1px solid var(--bdr); border-top:1px solid var(--bdr); rotate:45deg;
    }
    .nav-dropdown:hover .drop-menu {
      opacity:1; visibility:visible; pointer-events:all;
      transform:translateX(-50%) translateY(0);
      transition:opacity 0.18s var(--ease), transform 0.18s var(--ease), visibility 0s linear 0s;
    }
    .drop-item {
      display:flex; align-items:center; gap:0.75rem; padding:0.65rem 0.85rem;
      border-radius:8px; transition:background 0.15s; text-decoration:none; color:var(--dark);
    }
    .drop-item:hover { background:var(--light); }
    .drop-ico {
      width:30px; height:30px; border-radius:6px; background:#F0EEE9;
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
    }
    .drop-ico svg { width:15px; height:15px; stroke:var(--o); fill:none; stroke-width:1.75; stroke-linecap:round; stroke-linejoin:round; }
    .drop-label { font-size:0.83rem; font-weight:500; color:var(--dark); }

    /* CTA */
    .nav-cta {
      display:inline-flex; align-items:center; gap:0.4rem;
      padding:0.6rem 1.35rem; background:var(--grad); color:#fff;
      font-size:0.85rem; font-weight:500; border-radius:6px; flex-shrink:0;
      transition:opacity 0.2s, transform 0.2s var(--ease); text-decoration:none;
    }
    .nav-cta:hover { opacity:0.88; transform:translateY(-1px); }

    /* Hamburger */
    .ham {
      display:none; flex-direction:column; justify-content:center;
      align-items:center; gap:5px; cursor:pointer; padding:8px;
      background:none; border:none; width:40px; height:40px;
      flex-shrink:0; -webkit-appearance:none; appearance:none;
    }
    .ham span { display:block; width:22px; height:2px; background:var(--dark); border-radius:2px; flex-shrink:0; }

    /* Mobile nav overlay */
    .mob-nav {
      display:none; position:fixed; inset:0; z-index:300;
      background:rgba(14,14,20,0.97); flex-direction:column;
      align-items:stretch; justify-content:flex-start;
      opacity:0; transition:opacity 0.25s;
      visibility:hidden; pointer-events:none;
    }
    .mob-nav.open { display:flex !important; visibility:visible; pointer-events:all; opacity:1; }
    .mob-nav-bar {
      display:flex; align-items:center; justify-content:space-between;
      padding:1rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.07);
      flex-shrink:0; min-height:60px;
    }
    .mob-nav-brand { font-family:'Roboto',sans-serif; font-size:0.8rem; font-weight:700; color:rgba(255,255,255,0.3); letter-spacing:0.12em; text-transform:uppercase; }
    .mob-nav-scroll { flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; padding:1.25rem 2rem 3rem; }
    .mob-nav a { font-family:'Roboto',sans-serif; font-size:1.4rem; font-weight:700; color:rgba(255,255,255,0.85); padding:0.7rem 0; border-bottom:1px solid rgba(255,255,255,0.07); width:100%; text-decoration:none; display:block; transition:color 0.2s; }
    .mob-nav a:hover { color:#fff; }
    .mob-nav .mob-sub { font-size:0.9rem; font-weight:500; color:rgba(255,255,255,0.38); padding:0.5rem 0; border-bottom:none; letter-spacing:0.08em; text-transform:uppercase; margin-top:1rem; display:block; }
    .mob-nav .mob-cta { margin-top:1.5rem; display:inline-flex; align-items:center; gap:0.45rem; padding:0.85rem 2rem; background:linear-gradient(135deg,#C8102E 0%,#E85D04 52%,#F5A623 100%); color:#fff; font-size:1rem; font-weight:600; border-radius:8px; border-bottom:none; width:auto; }
    .mob-close { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:8px; cursor:pointer; padding:0.5rem 0.85rem; display:flex; align-items:center; gap:0.5rem; color:rgba(255,255,255,0.55); font-size:0.8rem; font-weight:500; font-family:'DM Sans',sans-serif; flex-shrink:0; -webkit-appearance:none; appearance:none; transition:background 0.15s, color 0.15s; }
    .mob-close:hover { background:rgba(255,255,255,0.1); color:#fff; }
    .mob-close svg { width:14px; height:14px; stroke:currentColor; fill:none; stroke-width:2.5; stroke-linecap:round; flex-shrink:0; }

    @media (max-width:820px) {
      .nav-links, .nav-cta { display:none; }
      .ham { display:flex; }
    }
  `;

  // ── Detect active page ────────────────────────────────────────
  const page = window.location.pathname.split('/').pop() || 'index.html';

  function isActive(href) {
    return page === href ? ' class="active"' : '';
  }
  function dropActive(href) {
    return page === href ? ' class="drop-item active"' : ' class="drop-item"';
  }

  // ── HTML ──────────────────────────────────────────────────────
  const MOBILE_NAV = `
<div class="mob-nav" id="mobNav" style="display:none">
  <div class="mob-nav-bar">
    <span class="mob-nav-brand">Menu</span>
    <button class="mob-close" id="mobClose" aria-label="Close menu">
      <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Close
    </button>
  </div>
  <div class="mob-nav-scroll">
    <span class="mob-sub">Services</span>
    <a href="cctv.html">CCTV</a>
    <a href="cctv-tower.html">Solar CCTV Tower</a>
    <a href="access-control.html">Access Control</a>
    <a href="wireless-networks.html">Wireless Networks</a>
    <a href="intruder-alarms.html">Intruder Alarms</a>
    <a href="fire-systems.html">Fire Systems</a>
    <a href="monitoring.html">24/7 Monitoring</a>
    <a href="ai-analytics.html">AI Analytics</a>
    <span class="mob-sub">Sectors</span>
    <a href="education.html">Education</a>
    <a href="public-sector.html">Public Sector</a>
    <span class="mob-sub">Tools</span>
    <a href="cost-estimator.html">Cost Estimator</a>
    <a href="your-site-tool.html">Your Site Tool</a>
    <a href="zone-planner.html">Zone Planner</a>
    <a href="compliance-tool.html">Compliance Tool</a>
    <a href="system-integration.html">System Integration</a>
    <a href="martyns-law-tool.html">Martyn's Law Assessment ⚠</a>
    <a href="school-security-policy-generator.html">CCTV Policy Generator</a>
    <a href="lockdown-procedure-tool.html">Lockdown Procedure Generator</a>
    <a href="security-policy-review.html">Policy Health Check 🤖</a>
    <span class="mob-sub">Insights</span>
    <a href="blog.html">All Articles</a>
    <span class="mob-sub">Company</span>
    <a href="index.html#about">About Us</a>
    <a href="mailto:hello@fyrflysystems.com" class="mob-cta">Get in Touch &rarr;</a>
  </div>
</div>`;

  const DESKTOP_NAV = `
<nav id="nav">
  <div class="nav-i">
    <a href="index.html" class="nav-logo">
      <picture>
        <source srcset="/fyrfly-logo.webp" type="image/webp">
        <img src="/fyrfly-logo.png" alt="Fyrfly Systems" width="160" height="50">
      </picture>
    </a>
    <ul class="nav-links">

      <li class="nav-dropdown">
        <a href="index.html#services">Services <svg class="chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></a>
        <div class="drop-menu">
          <a href="cctv.html"${dropActive('cctv.html')}>
            <div class="drop-ico"><svg viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg></div>
            <span class="drop-label">CCTV</span>
          </a>
          <a href="cctv-tower.html"${dropActive('cctv-tower.html')}>
            <div class="drop-ico"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
            <span class="drop-label">Solar CCTV Tower</span>
          </a>
          <a href="access-control.html"${dropActive('access-control.html')}>
            <div class="drop-ico"><svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>
            <span class="drop-label">Access Control</span>
          </a>
          <a href="wireless-networks.html"${dropActive('wireless-networks.html')}>
            <div class="drop-ico"><svg viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/></svg></div>
            <span class="drop-label">Wireless Networks</span>
          </a>
          <a href="intruder-alarms.html"${dropActive('intruder-alarms.html')}>
            <div class="drop-ico"><svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></div>
            <span class="drop-label">Intruder Alarms</span>
          </a>
          <a href="fire-systems.html"${dropActive('fire-systems.html')}>
            <div class="drop-ico"><svg viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg></div>
            <span class="drop-label">Fire Systems</span>
          </a>
          <a href="monitoring.html"${dropActive('monitoring.html')}>
            <div class="drop-ico"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div>
            <span class="drop-label">24/7 Monitoring</span>
          </a>
          <a href="ai-analytics.html"${dropActive('ai-analytics.html')}>
            <div class="drop-ico"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 110 20A10 10 0 0112 2z"/><path d="M8 12l2 2 4-4"/></svg></div>
            <span class="drop-label">AI Analytics</span>
          </a>
        </div>
      </li>

      <li><a href="education.html"${isActive('education.html')}>Education</a></li>
      <li><a href="public-sector.html"${isActive('public-sector.html')}>Public Sector</a></li>

      <li class="nav-dropdown">
        <a href="#">Tools <svg class="chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></a>
        <div class="drop-menu">
          <a href="cost-estimator.html"${dropActive('cost-estimator.html')}>
            <div class="drop-ico"><svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
            <span class="drop-label">Cost Estimator</span>
          </a>
          <a href="your-site-tool.html"${dropActive('your-site-tool.html')}>
            <div class="drop-ico"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
            <span class="drop-label">Your Site Tool</span>
          </a>
          <a href="zone-planner.html"${dropActive('zone-planner.html')}>
            <div class="drop-ico"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div>
            <span class="drop-label">Zone Planner</span>
          </a>
          <a href="compliance-tool.html"${dropActive('compliance-tool.html')}>
            <div class="drop-ico"><svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></div>
            <span class="drop-label">Compliance Tool</span>
          </a>
          <a href="system-integration.html"${dropActive('system-integration.html')}>
            <div class="drop-ico"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg></div>
            <span class="drop-label">System Integration</span>
          </a>
          <a href="martyns-law-tool.html"${dropActive('martyns-law-tool.html')} style="border-top:1px solid var(--bdr);margin-top:0.3rem;padding-top:0.65rem;">
            <div class="drop-ico" style="background:rgba(200,16,46,0.08);"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
            <span class="drop-label">Martyn's Law Assessment</span>
          </a>
          <a href="school-security-policy-generator.html"${dropActive('school-security-policy-generator.html')}>
            <div class="drop-ico" style="background:rgba(232,93,4,0.08);"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
            <span class="drop-label">CCTV Policy Generator</span>
          </a>
          <a href="lockdown-procedure-tool.html"${dropActive('lockdown-procedure-tool.html')}>
            <div class="drop-ico" style="background:rgba(245,166,35,0.08);"><svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>
            <span class="drop-label">Lockdown Procedure Generator</span>
          </a>
          <a href="security-policy-review.html"${dropActive('security-policy-review.html')} style="border-top:1px solid var(--bdr);margin-top:0.3rem;padding-top:0.65rem;">
            <div class="drop-ico" style="background:rgba(5,150,105,0.08);"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
            <span class="drop-label">Policy Health Check <span style="font-size:0.6rem;background:rgba(5,150,105,0.15);color:#059669;padding:0.1rem 0.35rem;border-radius:4px;margin-left:0.25rem;">AI</span></span>
          </a>
        </div>
      </li>

      <li><a href="blog.html"${isActive('blog.html')}>Insights</a></li>
      <li><a href="index.html#about">About</a></li>

    </ul>
    <a href="index.html#contact" class="nav-cta">Get in Touch &rarr;</a>
    <button class="ham" id="hamBtn" aria-label="Open navigation menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>`;

  // ── Inject CSS ────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  // ── Inject HTML into placeholder ──────────────────────────────
  const placeholder = document.getElementById('nav-placeholder');
  if (!placeholder) {
    console.warn('nav.js: no #nav-placeholder found on this page');
    return;
  }
  placeholder.outerHTML = MOBILE_NAV + DESKTOP_NAV;

  // ── Scroll shadow ─────────────────────────────────────────────
  const navEl = document.getElementById('nav');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navEl.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ── Mobile nav ────────────────────────────────────────────────
  const ham = document.getElementById('hamBtn');
  const mobNav = document.getElementById('mobNav');
  const mobClose = document.getElementById('mobClose');
  if (ham && mobNav) {
    ham.addEventListener('click', () => {
      mobNav.style.display = 'flex';
      requestAnimationFrame(() => {
        mobNav.classList.add('open');
        ham.setAttribute('aria-expanded', 'true');
      });
    });
    const closeNav = () => {
      mobNav.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
      setTimeout(() => { mobNav.style.display = 'none'; }, 260);
    };
    mobClose.addEventListener('click', closeNav);
    mobNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  }

})();

// ── Cookie notice ─────────────────────────────────────────
// Loads cookie-banner.js on every page except legal.html
(function() {
  if (window.location.pathname.indexOf('legal') !== -1) return;
  var s = document.createElement('script');
  s.src = '/cookie-banner.js';
  s.defer = true;
  document.head.appendChild(s);
})();


/* ── CONTACT MODAL ─────────────────────────────────────── */

/**
 * Fyrfly Systems — Contact Modal
 * ─────────────────────────────────────────────────────────────
 * Self-contained. Drop one <script> tag into every page.
 * No dependencies. No global pollution.
 *
 * Form submissions route via Formbold to hello@fyrflysystems.com
 * Dashboard: https://formbold.com/forms/3A7kr
 * Free plan: 100 submissions/month — no credit card required.
 * ─────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  var FORM_ENDPOINT = 'https://api.web3forms.com/submit';
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

              <form id="fm-form" action="https://formbold.com/s/3A7kr" method="POST" novalidate>

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

      // Build FormData from the form element (Formbold's preferred AJAX method)
      var firstName = document.getElementById('fm-name').value.trim().split(' ')[0];
      var formData  = new FormData(form);
      // Web3Forms public access key — safe to include in frontend code
      formData.append('access_key', 'ff37786b-ba02-4120-81ee-dfa181f68808');
      formData.append('subject', 'New Enquiry — Fyrfly Systems Website');
      formData.append('from_name', 'Fyrfly Systems Website');

      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body:   formData
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        if (data.success) {
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
        alert('Could not send your message. Please email us directly at ' + EMAIL);
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


/* ── FOOTER ────────────────────────────────────────────── */

/* footer.js — Fyrfly Systems standardised footer
   Usage: <div id="footer-placeholder"></div>
          <script src="footer.js"></script>
   Replaces any element with id="footer-placeholder" with the
   full site footer. Remove legacy <footer>...</footer> blocks
   from individual pages once this file is deployed.
   ──────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // ── CSS ────────────────────────────────────────────────────
  var css = `
.site-footer{background:#0E0E14;padding:4rem 0 0;font-family:'DM Sans',sans-serif;color:rgba(255,255,255,0.65);}
.site-footer *{box-sizing:border-box;margin:0;padding:0;}
.site-footer a{text-decoration:none;color:inherit;}

/* Grid */
.sft-grid{
  max-width:1200px;margin:0 auto;padding:0 2rem 3rem;
  display:grid;
  grid-template-columns:1.5fr 1fr 1fr 1fr 1fr;
  gap:2.5rem;
}

/* Brand column */
.sft-logo img{height:48px;display:block;}
.sft-tagline{
  font-size:0.83rem;color:rgba(255,255,255,0.35);
  line-height:1.65;max-width:24ch;margin-top:0.9rem;
}
.sft-accreds{
  display:flex;flex-direction:column;gap:0.35rem;margin-top:1.5rem;
}
.sft-accred{
  font-size:0.72rem;font-weight:500;color:rgba(255,255,255,0.28);
  display:flex;align-items:center;gap:0.45rem;line-height:1;
}
.sft-accred::before{
  content:'';display:inline-block;width:14px;height:1px;
  background:linear-gradient(90deg,#C8102E,#F5A623);flex-shrink:0;
}

/* Column headings */
.sft-heading{
  font-family:'Roboto',sans-serif;
  font-size:0.68rem;font-weight:700;letter-spacing:0.12em;
  text-transform:uppercase;color:rgba(255,255,255,0.25);
  margin-bottom:1rem;
}

/* Link lists */
.sft-links{list-style:none;display:flex;flex-direction:column;gap:0.55rem;}
.sft-links a{
  font-size:0.85rem;color:rgba(255,255,255,0.45);
  transition:color 0.2s;display:inline-block;
}
.sft-links a:hover{color:#fff;}
.sft-links .sft-badge{
  display:inline-block;margin-left:0.4rem;
  font-size:0.6rem;font-weight:700;letter-spacing:0.07em;
  text-transform:uppercase;padding:0.1rem 0.45rem;
  border-radius:100px;vertical-align:middle;
  background:rgba(200,16,46,0.25);color:rgba(255,100,80,0.9);
  border:1px solid rgba(200,16,46,0.3);
}

/* Second heading within a column */
.sft-heading-2{
  font-family:'Roboto',sans-serif;
  font-size:0.68rem;font-weight:700;letter-spacing:0.12em;
  text-transform:uppercase;color:rgba(255,255,255,0.25);
  margin-top:1.75rem;margin-bottom:0.9rem;
}

/* Contact items */
.sft-contact-item{
  font-size:0.85rem;color:rgba(255,255,255,0.45);
  margin-bottom:0.55rem;display:block;transition:color 0.2s;
}
.sft-contact-item:hover{color:#fff;}
.sft-location{
  font-size:0.78rem;color:rgba(255,255,255,0.22);
  margin-top:0.25rem;display:block;
}

/* Social icons */
.sft-social{display:flex;gap:0.65rem;margin-top:1.25rem;}
.sft-social a{
  width:32px;height:32px;border-radius:7px;
  background:rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.1);
  display:flex;align-items:center;justify-content:center;
  transition:background 0.2s,border-color 0.2s;
}
.sft-social a:hover{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);}
.sft-social svg{width:15px;height:15px;fill:rgba(255,255,255,0.5);}

/* Bottom bar */
.sft-bottom{
  max-width:1200px;margin:0 auto;
  padding:1.4rem 2rem;
  border-top:1px solid rgba(255,255,255,0.06);
  display:flex;align-items:center;justify-content:space-between;
  flex-wrap:wrap;gap:0.85rem;
}
.sft-copy{font-size:0.78rem;color:rgba(255,255,255,0.2);}
.sft-legal{display:flex;gap:1.5rem;}
.sft-legal a{font-size:0.78rem;color:rgba(255,255,255,0.2);transition:color 0.2s;}
.sft-legal a:hover{color:rgba(255,255,255,0.55);}

/* ── Responsive ─────────────────────────────────────────── */
@media(max-width:1100px){
  .sft-grid{grid-template-columns:1.3fr 1fr 1fr 1fr;gap:2rem;}
  .sft-grid > .sft-col-contact{grid-column:span 2;}
}
@media(max-width:768px){
  .sft-grid{grid-template-columns:1fr 1fr;gap:1.75rem;padding-bottom:2.5rem;}
  .sft-grid > .sft-col-brand{grid-column:span 2;}
  .sft-grid > .sft-col-contact{grid-column:span 1;}
}
@media(max-width:480px){
  .sft-grid{grid-template-columns:1fr;}
  .sft-grid > .sft-col-brand,
  .sft-grid > .sft-col-contact{grid-column:span 1;}
  .sft-bottom{flex-direction:column;align-items:flex-start;}
  .sft-legal{flex-wrap:wrap;gap:1rem;}
}
  `;

  // ── Inject CSS ──────────────────────────────────────────
  var styleEl = document.getElementById('sft-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'sft-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  // ── Current year ────────────────────────────────────────
  var year = new Date().getFullYear();

  // ── Footer HTML ─────────────────────────────────────────
  var html = '<footer class="site-footer">'
    + '<div class="sft-grid">'

    // ── Col 1: Brand ──────────────────────────────────────
    + '<div class="sft-col-brand">'
    +   '<div class="sft-logo">'
    +     '<a href="/index.html">'
    +       '<picture><source srcset="/fyrfly-logo-dark.webp" type="image/webp"><img src="/fyrfly-logo-dark.png" alt="Fyrfly Systems" loading="lazy" width="160" height="50"></picture>'
    +     '</a>'
    +   '</div>'
    +   '<p class="sft-tagline">Intelligent physical security systems for schools and the public sector across the United Kingdom.</p>'
    +   '<div class="sft-accreds">'
    +     '<span class="sft-accred">NSI NACOSS Gold</span>'
    +     '<span class="sft-accred">SSAIB Approved</span>'
    +     '<span class="sft-accred">ISO 9001:2015</span>'
    +     '<span class="sft-accred">BAFE SP203</span>'
    +     '<span class="sft-accred">Constructionline Gold</span>'
    +     '<span class="sft-accred">Crown Commercial Service</span>'
    +   '</div>'
    +   '<div class="sft-social">'
    +     '<a href="https://www.linkedin.com/company/fyrflysystems" aria-label="Fyrfly Systems on LinkedIn" target="_blank" rel="noopener">'
    +       '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>'
    +     '</a>'
    +     '<a href="https://github.com/silegrand/fyrflysystems" aria-label="Fyrfly Systems on GitHub" target="_blank" rel="noopener">'
    +       '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>'
    +     '</a>'
    +   '</div>'
    + '</div>'

    // ── Col 2: Services ───────────────────────────────────
    + '<div class="sft-col-services">'
    +   '<div class="sft-heading">Services</div>'
    +   '<ul class="sft-links">'
    +     '<li><a href="/cctv.html">CCTV Systems</a></li>'
    +     '<li><a href="/access-control.html">Access Control</a></li>'
    +     '<li><a href="/wireless-networks.html">Wireless Networks</a></li>'
    +     '<li><a href="/intruder-alarms.html">Intruder Alarms</a></li>'
    +     '<li><a href="/fire-systems.html">Fire Systems</a></li>'
    +     '<li><a href="/monitoring.html">24/7 Monitoring</a></li>'
    +     '<li><a href="/cctv-tower.html">Solar CCTV Tower<span class="sft-badge">New</span></a></li>'
    +     '<li><a href="/ai-analytics.html">AI Analytics</a></li>'
    +   '</ul>'
    + '</div>'

    // ── Col 3: Free Tools ─────────────────────────────────
    + '<div class="sft-col-tools">'
    +   '<div class="sft-heading">Free Tools</div>'
    +   '<ul class="sft-links">'
    +     '<li><a href="/cost-estimator.html">Cost Estimator</a></li>'
    +     '<li><a href="/zone-planner.html">Zone Planner</a></li>'
    +     '<li><a href="/compliance-tool.html">Compliance Checker</a></li>'
    +     '<li><a href="/system-integration.html">System Integration</a></li>'
    +     '<li><a href="/incident-analyser.html">Incident Analyser</a></li>'
    +     '<li><a href="/your-site-tool.html">Your Site Tool</a></li>'
    +     '<li><a href="/martyns-law-tool.html">Martyn\'s Law Assessment<span class="sft-badge">New</span></a></li>'
    +     '<li><a href="/school-security-policy-generator.html">CCTV Policy Generator<span class="sft-badge">New</span></a></li>'
    +     '<li><a href="/lockdown-procedure-tool.html">Lockdown Procedure</a></li>'
    +     '<li><a href="/security-policy-review.html">Policy Health Check<span class="sft-badge">AI</span></a></li>'
    +   '</ul>'
    + '</div>'

    // ── Col 4: Sectors & Resources ────────────────────────
    + '<div class="sft-col-resources">'
    +   '<div class="sft-heading">Sectors</div>'
    +   '<ul class="sft-links">'
    +     '<li><a href="/education.html">Education</a></li>'
    +     '<li><a href="/public-sector.html">Public Sector</a></li>'
    +   '</ul>'
    +   '<div class="sft-heading-2">Resources</div>'
    +   '<ul class="sft-links">'
    +     '<li><a href="/invisible-shield.html">The Invisible Shield</a></li>'
    +     '<li><a href="/connected-council.html">The Connected Council</a></li>'
    +     '<li><a href="/blog.html">Articles &amp; Guides</a></li>'
    +     '<li><a href="/index.html#about">About Fyrfly</a></li>'
    +   '</ul>'
    + '</div>'

    // ── Col 5: Contact ────────────────────────────────────
    + '<div class="sft-col-contact">'
    +   '<div class="sft-heading">Get in Touch</div>'
    +   '<a class="sft-contact-item" href="mailto:hello@fyrflysystems.com">hello@fyrflysystems.com</a>'
    +   '<a class="sft-contact-item" href="tel:+441234567890">01234 567 890</a>'
    +   '<span class="sft-location">Faversham, Kent &mdash; United Kingdom</span>'
    +   '<div class="sft-heading-2">Technical Assessment</div>'
    +   '<ul class="sft-links">'
    +     '<li><a href="mailto:hello@fyrflysystems.com?subject=Campus Infrastructure Assessment Request">Book a Free Assessment</a></li>'
    +     '<li><a href="/compliance-tool.html">Run Compliance Check</a></li>'
    +   '</ul>'
    + '</div>'

    + '</div>'// /sft-grid

    // ── Bottom bar ────────────────────────────────────────
    + '<div class="sft-bottom">'
    +   '<span class="sft-copy">&copy; ' + year + ' Fyrfly Systems Ltd. All rights reserved. Registered in England &amp; Wales.</span>'
    +   '<div class="sft-legal">'
    +     '<a href="/legal.html">Privacy Policy</a>'
    +     '<a href="/legal.html#cookies">Cookie Policy</a>'
    +     '<a href="/legal.html#terms">Terms of Service</a>'
    +   '</div>'
    + '</div>'

    + '</footer>';

  // ── Inject ───────────────────────────────────────────────
  var placeholder = document.getElementById('footer-placeholder');
  if (placeholder) {
    placeholder.outerHTML = html;
  } else {
    document.body.insertAdjacentHTML('beforeend', html);
  }

  // ── Load chat widget ─────────────────────────────────────
  if (!document.getElementById('fyrfly-chat-btn')) {
    var chatScript = document.createElement('script');
    chatScript.src = '/chat.js';
    chatScript.defer = true;
    document.body.appendChild(chatScript);
  }

}());
