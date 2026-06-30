// scripts/enrich-bursars-test-batch.mjs
//
// TEST BATCH: pulls up to 20 South East schools that have a website and no
// bursar_name yet, crawls each school's site for a staff/leadership page,
// and asks Claude to extract the Bursar (or equivalent — Director of
// Finance/Operations, COO) name/title/email. Updates Supabase with results
// and logs a per-school outcome so we can see hit rate before scaling to
// the full batch.
//
// Run this one first and check the results before building enrich-bursars-batch1.mjs
// against the full 348-school set.

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
  "our-team", "about-us", "about", "governance", "key-staff", "school-staff",
];

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
    const html = await res.text();
    return html;
  } catch (err) {
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

function findStaffPageCandidates(links) {
  return links.filter((link) =>
    STAFF_PAGE_HINTS.some((hint) => link.toLowerCase().includes(hint))
  );
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 15000); // keep prompt size sane
}

async function askClaudeForBursar(schoolName, pageText) {
  const prompt = `You are extracting a single fact from a UK independent school's staff/about page.

School name: ${schoolName}

Below is the visible text scraped from a page on that school's website. Find the person who holds the Bursar role, or the closest equivalent (Director of Finance, Director of Operations, Director of Resources, Chief Operating Officer, Finance Director, Business Manager) — this is the role responsible for finance/operations/facilities, NOT academic staff.

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
  let candidates = findStaffPageCandidates(links);

  // Fall back to the homepage itself if no staff-style link found —
  // some small school sites list everyone on one page.
  let pageHtml = null;
  let pageUrlUsed = null;

  for (const candidate of candidates.slice(0, 3)) {
    const html = await fetchText(candidate);
    if (html) {
      pageHtml = html;
      pageUrlUsed = candidate;
      break;
    }
  }

  if (!pageHtml) {
    pageHtml = homeHtml;
    pageUrlUsed = school.website_url;
  }

  const pageText = stripHtml(pageHtml);

  let extraction;
  try {
    extraction = await askClaudeForBursar(school.school_name, pageText);
  } catch (err) {
    result.status = "claude_error";
    result.error = String(err);
    return result;
  }

  result.page_checked = pageUrlUsed;

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

async function main() {
  const { data: schools, error } = await supabase
    .from("independent_schools")
    .select("urn, school_name, website_url")
    .not("website_url", "is", null)
    .is("bursar_name", null)
    .limit(TEST_LIMIT);

  if (error) {
    console.error("Error fetching schools:", error);
    process.exit(1);
  }

  console.log(`Test batch: ${schools.length} schools.\n`);

  const results = [];
  for (const school of schools) {
    console.log(`Processing: ${school.school_name} (${school.website_url})`);
    const r = await processSchool(school);
    results.push(r);
    console.log(`  -> ${r.status}${r.bursar_name ? ": " + r.bursar_name + " (" + r.bursar_title + ")" : ""}`);
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
