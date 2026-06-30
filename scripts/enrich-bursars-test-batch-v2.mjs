// scripts/enrich-bursars-test-batch-v2.mjs
//
// TUNED RE-RUN of the test batch against the same 20 schools, to compare
// hit rate before/after. Changes from v1:
//   1. Tries up to 3 candidate staff-style pages and concatenates their
//      text (instead of stopping at the first one that loads) — a page
//      titled "About" sometimes has no staff names but a sibling
//      "Senior Leadership Team" page does.
//   2. Widened hint keywords (senior-team, governance, key-contacts,
//      the-team, our-people, contact-us, staff-list, etc).
//   3. When no nav link matches any hint at all (e.g. JS-rendered menus
//      that don't appear in raw HTML), falls back to guessing a handful
//      of common URL paths directly.
//
// Once this is confirmed as an improvement, the same logic moves into
// enrich-bursars-batch1.mjs for the full 348-school run.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
  console.error("Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or ANTHROPIC_API_KEY env vars.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const TEST_LIMIT = 20;

const STAFF_PAGE_HINTS = [
  "staff", "who-we-are", "whos-who", "who's-who", "meet-the-team",
  "meet-our-team", "leadership", "senior-leadership", "senior-management",
  "senior-team", "our-team", "our-people", "the-team", "about-us", "about",
  "governance", "key-staff", "school-staff", "key-contacts", "staff-list",
  "academic-staff", "non-teaching-staff", "support-staff", "management-team",
  "school-team", "people", "contact-us", "contact",
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
  // Rank by specificity: staff/leadership-style hints first, generic
  // about/contact hints last (those are less likely to list named roles).
  const strongHints = [
    "staff", "who-we-are", "whos-who", "who's-who", "meet-the-team",
    "meet-our-team", "leadership", "senior-leadership", "senior-management",
    "senior-team", "key-staff", "school-staff", "staff-list",
    "academic-staff", "non-teaching-staff", "support-staff", "management-team",
  ];
  const weakHints = [
    "our-team", "our-people", "the-team", "about-us", "about", "governance",
    "key-contacts", "school-team", "people", "contact-us", "contact",
  ];

  const scored = links
    .map((link) => {
      const lower = link.toLowerCase();
      if (strongHints.some((h) => lower.includes(h))) return { link, score: 2 };
      if (weakHints.some((h) => lower.includes(h))) return { link, score: 1 };
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

async function askClaudeForBursar(schoolName, pageText) {
  const prompt = `You are extracting a single fact from text scraped across one or more pages of a UK independent school's website.

School name: ${schoolName}

Find the person who holds the Bursar role, or the closest equivalent (Director of Finance, Director of Operations, Director of Resources, Chief Operating Officer, Finance Director, Head of Finance, Business Manager) — this is the role responsible for finance/operations/facilities, NOT academic staff.

Respond ONLY with a JSON object, no preamble, no markdown fences:
{
  "found": true or false,
  "name": "Full Name" or null,
  "title": "exact job title as written on the page" or null,
  "email": "email address if visible on the page" or null
}

If you cannot find a Bursar-equivalent role with reasonable confidence, respond with found: false and the other fields null. Do not guess or invent a name.

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
    return { found: false, name: null, title: null, email: null, _raw: text };
  }
}

async function processSchool(school) {
  const result = { urn: school.urn, school_name: school.school_name, status: "pending", pages_checked: [] };

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
      result.pages_checked.push(url);
    }
  }

  // Always include homepage text too, in case the team is listed there
  // directly on small school sites.
  textChunks.push(`--- Page: ${school.website_url} (homepage) ---\n${stripHtml(homeHtml)}`);

  const combinedText = textChunks.join("\n\n").slice(0, 25000); // keep prompt size sane

  let extraction;
  try {
    extraction = await askClaudeForBursar(school.school_name, combinedText);
  } catch (err) {
    result.status = "claude_error";
    result.error = String(err);
    return result;
  }

  if (!extraction.found || !extraction.name) {
    result.status = "not_found";
    return result;
  }

  const { error } = await supabase
    .from("independent_schools")
    .update({
      bursar_name: extraction.name,
      bursar_title: extraction.title,
      bursar_email: extraction.email,
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
  result.bursar_name = extraction.name;
  result.bursar_title = extraction.title;
  result.bursar_email = extraction.email;
  return result;
}

// The exact 20 URNs the v1 test batch processed, pinned explicitly so this
// is a true before/after comparison rather than relying on row ordering.
const V1_TEST_URNS = [
  100528, 110109, 110110, 110111, 110114, 110117, 110118, 110119, 110120,
  110121, 110122, 110124, 110125, 110126, 110127, 110128, 110130, 110131,
  110132, 110133,
];

async function main() {
  const { data: schools, error } = await supabase
    .from("independent_schools")
    .select("urn, school_name, website_url")
    .in("urn", V1_TEST_URNS);

  if (error) {
    console.error("Error fetching schools:", error);
    process.exit(1);
  }

  console.log(`Test batch v2: ${schools.length} schools.\n`);

  const results = [];
  for (const school of schools) {
    console.log(`Processing: ${school.school_name} (${school.website_url})`);
    const r = await processSchool(school);
    results.push(r);
    console.log(`  -> ${r.status}${r.bursar_name ? ": " + r.bursar_name + " (" + r.bursar_title + ")" : ""}`);
    if (r.pages_checked && r.pages_checked.length) {
      console.log(`     pages checked: ${r.pages_checked.join(", ")}`);
    }
  }

  console.log("\n--- SUMMARY ---");
  const counts = {};
  for (const r of results) counts[r.status] = (counts[r.status] || 0) + 1;
  console.log(counts);
  console.log(`\nFound bursar for ${counts.found || 0} / ${results.length} schools in this test batch.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
