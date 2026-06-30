// scripts/enrich-bursars-batch1-full.mjs
//
// Full run: same crawl/extraction logic as the v2 test (ranked candidate
// pages, widened hints, guessed-path fallback, multi-page concatenation),
// applied to all remaining South East schools that have a website and
// haven't already been processed in the 20-school test batches.
//
// Safe to re-run: only pulls rows where bursar_name is still null, so a
// partial/failed run can simply be triggered again to pick up where it
// left off.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
  console.error("Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or ANTHROPIC_API_KEY env vars.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// The 20 URNs already processed in the test batches (v1 + v2) — excluded
// here so we don't waste API calls re-checking them. v2 already wrote
// results for the 12 it found; the other 8 are genuinely hard cases best
// revisited manually rather than re-burning attempts in the full run.
const ALREADY_PROCESSED_URNS = [
  100528, 110109, 110110, 110111, 110114, 110117, 110118, 110119, 110120,
  110121, 110122, 110124, 110125, 110126, 110127, 110128, 110130, 110131,
  110132, 110133,
];

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
    extraction = await askClaudeForBursar(school.school_name, combinedText);
  } catch (err) {
    result.status = "claude_error";
    result.error = String(err);
    return result;
  }

  if (!extraction.found || !extraction.name) {
    result.status = "not_found";
    // Mark as checked so re-runs don't keep retrying schools where the
    // bursar genuinely isn't published, unless you clear website_status
    // manually to force a re-check.
    await supabase
      .from("independent_schools")
      .update({ website_status: "checked_not_found", enriched_at: new Date().toISOString() })
      .eq("urn", school.urn);
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

async function main() {
  const { data: schools, error } = await supabase
    .from("independent_schools")
    .select("urn, school_name, website_url")
    .not("website_url", "is", null)
    .is("bursar_name", null)
    .not("urn", "in", `(${ALREADY_PROCESSED_URNS.join(",")})`)
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
    console.log(`  -> ${r.status}${r.bursar_name ? ": " + r.bursar_name + " (" + r.bursar_title + ")" : ""}`);
  }

  console.log("\n--- SUMMARY ---");
  const counts = {};
  for (const r of results) counts[r.status] = (counts[r.status] || 0) + 1;
  console.log(counts);
  console.log(`\nFound bursar for ${counts.found || 0} / ${results.length} schools processed this run.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
