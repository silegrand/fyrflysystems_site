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
    <a href="about.html">About Us</a>
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
      <li><a href="about.html"${isActive('about.html')}>About</a></li>

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
