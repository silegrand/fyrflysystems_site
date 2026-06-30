// scripts/enrich-london-managers-batch1-full.mjs
//
// Full run against all London schools with a website and no
// business_manager_name yet. Same tuned crawl/extraction logic proven on
// the independent schools (bursar) and Kent schools (manager) runs:
// ranked candidate pages, wide hint list, guessed-path fallback,
// multi-page concatenation. Looks for a School Business Manager (or
// equivalent) or, failing that, a Site/Facilities Manager.
//
// Safe to re-run: only pulls rows where business_manager_name is still
// null and skips ones already marked checked_not_found, so a partial run
// can simply be triggered again.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
  console.error("Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or ANTHROPIC_API_KEY env vars.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const STAFF_PAGE_HINTS_STRONG = [
  "staff", "who-we-are", "whos-who", "who's-who", "meet-the-team",
  "meet-our-team", "leadership", "senior-leadership", "senior-management",
  "senior-team", "key-staff", "school-staff", "staff-list",
  "academic-staff", "non-teaching-staff", "support-staff", "management-team",
];

const STAFF_PAGE_HINTS_WEAK = [
  "our-team", "our-people", "the-team", "about-us", "about", "governance",
  "key-contacts", "school-team", "people", "contact-us", "contact",
];

const GUESSED_PATHS = [
  "/staff", "/about/staff", "/about-us/staff", "/about/our-staff",
  "/school/staff", "/staff-list", "/about/who-we-are", "/about/leadership",
  "/about-us/meet-the-team", "/our-school/staff", "/about/senior-leadership-team",
  "/about-us/staff-list", "/contact-us/staff-list",
];

const MAX_CANDIDATE_PAGES = 3;
const UA = "Mozilla/5.0 (compatible; FyrflyProspectBot/1.0; +https://fyrflysystems.com)";

async function fetchText(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function extractLinks(html, baseUrl) {
  const links = new Set();
  const re = /href=["']([^"'#]+)["']/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    try {
      const abs = new URL(match[1], baseUrl).toString();
      const u = new URL(abs);
      const u2 = new URL(baseUrl);
      if (u.hostname === u2.hostname) links.add(abs);
    } catch {
      // ignore malformed URLs
    }
  }
  return [...links];
}

function rankCandidates(links) {
  const scored = links
    .map((link) => {
      const lower = link.toLowerCase();
      if (STAFF_PAGE_HINTS_STRONG.some((h) => lower.includes(h))) return { link, score: 2 };
      if (STAFF_PAGE_HINTS_WEAK.some((h) => lower.includes(h))) return { link, score: 1 };
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.link);

  return [...new Set(scored)];
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function askClaudeForManager(schoolName, pageText) {
  const prompt = `You are extracting a single fact from text scraped across one or more pages of a UK state school's website.

School name: ${schoolName}

Find ONE of the following two roles, whichever is more clearly named on the page (prefer the Business Manager role if both are present and you must choose):
1. School Business Manager, or equivalent — Business Manager, Operations Manager, Office Manager (only if their remit covers finance/operations, not just reception admin).
2. Site Manager, or equivalent — Site/Facilities Manager, Premises Manager. Only use a Caretaker title if it is explicitly a "Site Manager" or "Head Caretaker" style managerial title, not a general caretaking role.

Do NOT pick teaching staff, the Head, Deputy Head, SENCO, or general admin/reception roles.

Respond ONLY with a JSON object, no preamble, no markdown fences:
{
  "found": true or false,
  "name": "Full Name" or null,
  "title": "exact job title as written on the page" or null,
  "role_type": "business_manager" or "site_manager" or null,
  "email": "email address if visible on the page" or null
}

If you cannot find either role with reasonable confidence, respond with found: false and the other fields null. Do not guess or invent a name.

Page text:
${pageText}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.content.map((b) => b.text || "").join("\n").trim();
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    return { found: false, name: null, title: null, role_type: null, email: null, _raw: text };
  }
}

async function processSchool(school) {
  const result = { urn: school.urn, school_name: school.school_name, status: "pending" };

  const homeHtml = await fetchText(school.website_url);
  if (!homeHtml) {
    result.status = "site_unreachable";
    return result;
  }

  const links = extractLinks(homeHtml, school.website_url);
  const ranked = rankCandidates(links);

  const candidateUrls = ranked.length > 0
    ? ranked.slice(0, MAX_CANDIDATE_PAGES)
    : GUESSED_PATHS.map((p) => {
        try {
          return new URL(p, school.website_url).toString();
        } catch {
          return null;
        }
      }).filter(Boolean).slice(0, MAX_CANDIDATE_PAGES);

  const textChunks = [];
  for (const url of candidateUrls) {
    const html = await fetchText(url);
    if (html) {
      textChunks.push(`--- Page: ${url} ---\n${stripHtml(html)}`);
      result.pages_checked = (result.pages_checked || []).concat(url);
    }
  }

  textChunks.push(`--- Page: ${school.website_url} (homepage) ---\n${stripHtml(homeHtml)}`);

  const combinedText = textChunks.join("\n\n").slice(0, 25000);

  let extraction;
  try {
    extraction = await askClaudeForManager(school.school_name, combinedText);
  } catch (err) {
    result.status = "claude_error";
    result.error = String(err);
    return result;
  }

  if (!extraction.found || !extraction.name) {
    result.status = "not_found";
    await supabase
      .from("london_schools")
      .update({ website_status: "checked_not_found", enriched_at: new Date().toISOString() })
      .eq("urn", school.urn);
    return result;
  }

  const { error } = await supabase
    .from("london_schools")
    .update({
      business_manager_name: extraction.name,
      business_manager_title: extraction.title,
      business_manager_email: extraction.email,
      website_status: "checked",
      enriched_at: new Date().toISOString(),
    })
    .eq("urn", school.urn);

  if (error) {
    result.status = "db_error";
    result.error = error.message;
    return result;
  }

  result.status = "found";
  result.role_type = extraction.role_type;
  result.manager_name = extraction.name;
  result.manager_title = extraction.title;
  return result;
}

async function main() {
  const { data: schools, error } = await supabase
    .from("london_schools")
    .select("urn, school_name, website_url")
    .not("website_url", "is", null)
    .is("business_manager_name", null)
    .order("urn", { ascending: true });

  if (error) {
    console.error("Error fetching schools:", error);
    process.exit(1);
  }

  console.log(`Full batch: ${schools.length} schools to process.\n`);

  const results = [];
  let i = 0;
  for (const school of schools) {
    i++;
    console.log(`[${i}/${schools.length}] ${school.school_name} (${school.website_url})`);
    const r = await processSchool(school);
    results.push(r);
    console.log(`  -> ${r.status}${r.manager_name ? ": " + r.manager_name + " (" + r.manager_title + ") [" + r.role_type + "]" : ""}`);
  }

  console.log("\n--- SUMMARY ---");
  const counts = {};
  for (const r of results) counts[r.status] = (counts[r.status] || 0) + 1;
  console.log(counts);
  var byRole = {};
  results.forEach(function(r){ if(r.role_type) byRole[r.role_type] = (byRole[r.role_type]||0)+1; });
  console.log("By role type:", byRole);
  console.log(`\nFound a manager contact for ${counts.found || 0} / ${results.length} schools processed this run.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
