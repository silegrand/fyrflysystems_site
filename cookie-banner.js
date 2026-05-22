/**
 * cookie-banner.js — Fyrfly Systems
 * Information-only cookie notice consistent with DUAA 2025 / PECR 2003
 * (no consent required for strictly necessary + statistical-only analytics)
 * Dismiss state stored in localStorage; banner never shown again once closed.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'fyrfly_cookie_notice_dismissed';

  // Already dismissed — do nothing
  try {
    if (localStorage.getItem(STORAGE_KEY) === '1') return;
  } catch (e) {}

  var CSS = [
    '#fy-cb{',
      'position:fixed;bottom:0;left:0;right:0;z-index:99999;',
      'background:#1B1B24;',
      'border-top:3px solid transparent;',
      'border-image:linear-gradient(90deg,#C8102E 0%,#E85D04 52%,#F5A623 100%) 1;',
      'padding:1rem 1.5rem;',
      'display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;',
      'font-family:"DM Sans",sans-serif;',
      'box-shadow:0 -4px 24px rgba(0,0,0,0.35);',
      'transform:translateY(100%);',
      'transition:transform 0.4s cubic-bezier(0.22,1,0.36,1);',
    '}',
    '#fy-cb.fy-cb-show{transform:translateY(0);}',
    '#fy-cb-text{',
      'flex:1;min-width:220px;',
      'font-size:0.875rem;color:rgba(255,255,255,0.65);line-height:1.6;',
    '}',
    '#fy-cb-text a{',
      'color:#F5A623;text-decoration:underline;white-space:nowrap;',
    '}',
    '#fy-cb-text a:hover{color:#E85D04;}',
    '#fy-cb-btns{display:flex;gap:0.75rem;flex-shrink:0;flex-wrap:wrap;}',
    '#fy-cb-ok{',
      'padding:0.55rem 1.4rem;',
      'background:linear-gradient(135deg,#C8102E 0%,#E85D04 52%,#F5A623 100%);',
      'color:#fff;font-size:0.875rem;font-weight:600;',
      'border:none;border-radius:8px;cursor:pointer;',
      'font-family:"DM Sans",sans-serif;white-space:nowrap;',
      'transition:opacity 0.2s;',
    '}',
    '#fy-cb-ok:hover{opacity:0.85;}',
    '#fy-cb-more{',
      'padding:0.55rem 1.1rem;',
      'background:transparent;',
      'color:rgba(255,255,255,0.5);font-size:0.875rem;',
      'border:1px solid rgba(255,255,255,0.18);border-radius:8px;cursor:pointer;',
      'font-family:"DM Sans",sans-serif;white-space:nowrap;',
      'transition:all 0.2s;',
    '}',
    '#fy-cb-more:hover{color:#fff;border-color:rgba(255,255,255,0.45);}',
    '@media(max-width:520px){',
      '#fy-cb{padding:1rem;}',
      '#fy-cb-btns{width:100%;}',
      '#fy-cb-ok,#fy-cb-more{flex:1;text-align:center;}',
    '}'
  ].join('');

  // Inject styles
  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  // Build banner
  var banner = document.createElement('div');
  banner.id = 'fy-cb';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Cookie notice');

  var text = document.createElement('p');
  text.id = 'fy-cb-text';
  text.innerHTML = [
    'We use cookies to keep this site working and to measure how it is used — ',
    'no advertising or tracking cookies are set. ',
    'See our <a href="/legal.html">Cookie Policy</a> for full details.'
  ].join('');

  var btns = document.createElement('div');
  btns.id = 'fy-cb-btns';

  var okBtn = document.createElement('button');
  okBtn.id = 'fy-cb-ok';
  okBtn.textContent = 'Got it';
  okBtn.setAttribute('aria-label', 'Dismiss cookie notice');

  var moreBtn = document.createElement('button');
  moreBtn.id = 'fy-cb-more';
  moreBtn.textContent = 'Cookie Policy';
  moreBtn.setAttribute('aria-label', 'Read our Cookie Policy');

  btns.appendChild(okBtn);
  btns.appendChild(moreBtn);
  banner.appendChild(text);
  banner.appendChild(btns);

  function dismiss() {
    banner.classList.remove('fy-cb-show');
    banner.addEventListener('transitionend', function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, { once: true });
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
  }

  okBtn.addEventListener('click', dismiss);

  moreBtn.addEventListener('click', function () {
    window.location.href = '/legal.html#cookies';
  });

  // Keyboard: Escape dismisses
  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') {
      dismiss();
      document.removeEventListener('keydown', handler);
    }
  });

  // Mount and animate in after a short delay
  document.body.appendChild(banner);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      banner.classList.add('fy-cb-show');
    });
  });

})();
