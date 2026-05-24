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
.site-footer{background:#0E0E14;padding:4rem 0 0;font-family:'DM Sans',sans-serif;}
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
