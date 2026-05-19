# Fyrfly Systems — www.fyrflysystems.com

**NSI NACOSS Gold certified physical security for schools and the public sector across the United Kingdom.**

[![Site Status](https://img.shields.io/website?url=https%3A%2F%2Fwww.fyrflysystems.com&label=fyrflysystems.com)](https://www.fyrflysystems.com)
[![License: Proprietary](https://img.shields.io/badge/license-proprietary-lightgrey)](https://www.fyrflysystems.com)
[![Accreditation: NSI NACOSS Gold](https://img.shields.io/badge/NSI-NACOSS%20Gold-C8102E)](https://www.nsi.org.uk)
[![Accreditation: BAFE](https://img.shields.io/badge/BAFE-Registered-E85D04)](https://www.bafe.org.uk)

---

## About Fyrfly Systems

Fyrfly Systems designs, installs and maintains integrated physical security systems for UK schools, colleges, Multi-Academy Trusts, local authorities and NHS estates. We specialise in the two sectors that demand the most from a security partner — education and the public sector — where compliance obligations, safeguarding requirements and procurement frameworks make the choice of provider critical.

Our work covers six disciplines: CCTV, access control, wireless networks, intruder alarms, fire systems and 24/7 professional monitoring. We design every system to work as an integrated ecosystem rather than a collection of standalone products, and we maintain long-term care contracts with clients who have been with us for years.

**Accreditations:** NSI NACOSS Gold · SSAIB Approved · BAFE Registered · Constructionline · ISO 9001:2015 · Crown Commercial Service

---

## This Repository

This repository contains the complete source code for [www.fyrflysystems.com](https://www.fyrflysystems.com), a static HTML site hosted on GitHub Pages.

The site is built entirely in vanilla HTML, CSS and JavaScript — no frameworks, no build tools, no dependencies. It is designed for performance, accessibility and SEO, and achieves a 92+ Lighthouse score across all pages.

---

## Site Structure

### Service Pages

| Page | URL |
|---|---|
| CCTV Systems | [/cctv.html](https://www.fyrflysystems.com/cctv.html) |
| Access Control | [/access-control.html](https://www.fyrflysystems.com/access-control.html) |
| Wireless Networks | [/wireless-networks.html](https://www.fyrflysystems.com/wireless-networks.html) |
| Intruder Alarms | [/intruder-alarms.html](https://www.fyrflysystems.com/intruder-alarms.html) |
| Fire Systems | [/fire-systems.html](https://www.fyrflysystems.com/fire-systems.html) |
| 24/7 Monitoring | [/monitoring.html](https://www.fyrflysystems.com/monitoring.html) |
| Support & Maintenance | [/support-maintenance.html](https://www.fyrflysystems.com/support-maintenance.html) |
| AI & Analytics | [/ai-analytics.html](https://www.fyrflysystems.com/ai-analytics.html) |

### Sector Pages

| Page | URL |
|---|---|
| Education | [/education.html](https://www.fyrflysystems.com/education.html) |
| Public Sector | [/public-sector.html](https://www.fyrflysystems.com/public-sector.html) |

### Interactive Tools

Five free tools built specifically for school business managers, facilities leads and public sector estates teams:

| Tool | URL | Description |
|---|---|---|
| **Incident Pattern Analyser** | [/incident-analyser.html](https://www.fyrflysystems.com/incident-analyser.html) | Paste an incident log and get instant pattern analysis — peak time windows, hotspot locations, day-of-week trends and recommended interventions. Runs entirely in-browser, no data stored. |
| **Security Zone Planner** | [/zone-planner.html](https://www.fyrflysystems.com/zone-planner.html) | Draw a building layout on a canvas, drop pins on problem areas, get system recommendations for each zone. Generates a downloadable PDF report. |
| **Cost Estimator** | [/cost-estimator.html](https://www.fyrflysystems.com/cost-estimator.html) | Entry Level vs Enterprise CCTV pricing comparison with a 10-year Total Cost of Ownership chart. Tiered access control pricing per door. |
| **Compliance Tool** | [/compliance-tool.html](https://www.fyrflysystems.com/compliance-tool.html) | Sector-adaptive compliance checker against KCSiE, UK GDPR, BS 5839, Surveillance Camera Code and more. Generates a Red/Amber/Green scorecard and PDF report. |
| **System Integration Diagram** | [/system-integration.html](https://www.fyrflysystems.com/system-integration.html) | Animated interactive diagram showing how CCTV, access control, intruder alarms, fire systems and monitoring connect as one ecosystem. |

### Insights — Articles

14 original articles written for non-technical decision makers in schools and the public sector:

- [What Your Incident Log Is Telling You (And How to Read It)](https://www.fyrflysystems.com/article-incident-log-analysis.html)
- [Why School Holidays Are Your Highest-Risk Period](https://www.fyrflysystems.com/article-school-holiday-security.html)
- [CCTV in Schools: What the Law Requires](https://www.fyrflysystems.com/article-cctv-privacy-schools.html)
- [Access Control in Schools: A Practical Guide](https://www.fyrflysystems.com/article-access-control-schools-guide.html)
- [School Security Done Right: Why Technology Alone Is Never the Answer](https://www.fyrflysystems.com/article-whole-school-security-approach.html)
- [Integrated Security Systems: What It Really Means](https://www.fyrflysystems.com/article-integrating-cctv-access-control.html)
- [Physical Security in the Public Sector](https://www.fyrflysystems.com/article-public-sector-security-framework.html)
- [The DfE Protective Security and Preparedness Guidance](https://www.fyrflysystems.com/article-dfe-protective-security-preparedness.html)
- [Martyn's Law and the Protect Duty](https://www.fyrflysystems.com/article-martyns-law-protect-duty-schools-public-sector.html)
- [Security Across a Multi-Academy Trust](https://www.fyrflysystems.com/article-mat-security-management.html)
- [Making the Financial Case for CCTV to Your Governors](https://www.fyrflysystems.com/article-financial-case-school-cctv.html)
- [From Passive Recording to Active Intelligence: AI-Enabled CCTV](https://www.fyrflysystems.com/article-ai-cctv-analytics-schools-public-sector.html)
- [Tackling ASB and Fly-Tipping: A Guide for Local Authorities](https://www.fyrflysystems.com/article-tackling-asb-fly-tipping-public-sector.html)
- [Wireless Networks for CCTV](https://www.fyrflysystems.com/article-wireless-cctv-networks-public-sector.html)

---

## Technical Details

### Architecture

- **Hosting:** GitHub Pages (custom domain via CNAME)
- **Stack:** Static HTML5, CSS3, vanilla JavaScript — zero dependencies, no framework
- **Navigation:** Shared `nav.js` file injected via `<div id="nav-placeholder"></div>` — update once, applies everywhere
- **Analytics:** Google Analytics 4 (G-4XLH0L6H2Z)
- **Performance:** 92 Lighthouse score, non-blocking font loading, WebP images with PNG fallback, LCP preload, passive scroll listeners, `content-visibility: auto` on below-fold sections

### Design System

```css
--c:    #C8102E   /* Fyrfly Red */
--o:    #E85D04   /* Orange */
--a:    #F5A623   /* Amber */
--grad: linear-gradient(135deg, #C8102E 0%, #E85D04 52%, #F5A623 100%)
--dark: #0E0E14   /* Near black */
--mid:  #67677A   /* Mid grey */
--light:#F5F4F2   /* Off white */
```

**Typography:** Roboto (headings, 400/500/700/900) + DM Sans (body, 300/400/500)

### SEO

- Canonical URLs on every page
- JSON-LD structured data (LocalBusiness, Service, Article schemas)
- Open Graph and Twitter Card meta tags
- `sitemap.xml` submitted to Google Search Console
- `robots.txt` pointing to sitemap
- `llms.txt` — structured context file for AI systems and LLM-powered search (Perplexity, ChatGPT Search, Microsoft Copilot)

### Compliance Standards Referenced

The site content covers the following UK compliance frameworks relevant to school and public sector security:

`KCSiE` · `UK GDPR` · `DPA 2018` · `Surveillance Camera Code of Practice` · `BS 5839-1` · `Regulatory Reform (Fire Safety) Order 2005` · `BS 8243` · `NSI NACOSS Gold` · `BAFE` · `Crown Commercial Service` · `Cyber Essentials` · `Martyn's Law (Terrorism Protection of Premises Act)`

---

## Contact

**Fyrfly Systems Ltd**
hello@fyrflysystems.com
www.fyrflysystems.com

Registered in England & Wales · NSI NACOSS Gold · SSAIB Approved · BAFE Registered · Constructionline · ISO 9001:2015 · Crown Commercial Service

---

*© 2026 Fyrfly Systems Ltd. All rights reserved. Site content is proprietary — not licensed for reuse.*
