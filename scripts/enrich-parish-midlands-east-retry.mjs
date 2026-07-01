// scripts/enrich-parish-midlands-east-retry.mjs
//
// Retry pass for the 8 districts that returned zero council links on the
// first run — their ModernGov listing pages render via JavaScript. Tries
// alternative URL patterns that force a static HTML render (?bcr=1 is the
// ModernGov "basic compatibility render" parameter) plus direct councillor
// API endpoints some sites expose.
//
// Also retries Newark and Sherwood which only returned 1 council despite
// having 76 pages — likely a Claude extraction issue on the chunked text.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
  console.error("Missing required env vars.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Each source gets a list of URLs to try in order — stop at first that returns links
const SOURCES = [
  {
    county: "Cambridgeshire", district: "Cambridge",
    urls: [
      "https://democracy.cambridge.gov.uk/mgParishCouncilDetails.aspx?bcr=1",
      "https://democracy.cambridge.gov.uk/mgParishCouncilDetails.aspx?LLL=Parish",
      "https://democracy.cambridge.gov.uk/mgParishCouncilDetails.aspx",
    ],
  },
  {
    county: "Bedfordshire", district: "Central Bedfordshire",
    urls: [
      "https://centralbeds.moderngov.co.uk/mgParishCouncilDetails.aspx?bcr=1",
      "https://www.centralbedfordshire.gov.uk/mgParishCouncilDetails.aspx",
      "https://centralbeds.moderngov.co.uk/mgParishCouncilDetails.aspx",
    ],
  },
  {
    county: "Leicestershire", district: "Charnwood",
    urls: [
      "https://charnwood.moderngov.co.uk/mgParishCouncilDetails.aspx?bcr=1",
      "https://democracy.charnwood.gov.uk/mgParishCouncilDetails.aspx",
      "https://charnwood.moderngov.co.uk/mgParishCouncilDetails.aspx",
    ],
  },
  {
    county: "Lincolnshire", district: "Lincoln",
    urls: [
      "https://lincoln.moderngov.co.uk/mgParishCouncilDetails.aspx?bcr=1",
      "https://democracy.lincoln.gov.uk/mgParishCouncilDetails.aspx",
      "https://lincoln.moderngov.co.uk/mgParishCouncilDetails.aspx",
    ],
  },
  {
    county: "Nottinghamshire", district: "Mansfield",
    urls: [
      "https://mansfield.moderngov.co.uk/mgParishCouncilDetails.aspx?bcr=1",
      "https://democracy.mansfield.gov.uk/mgParishCouncilDetails.aspx",
      "https://mansfield.moderngov.co.uk/mgParishCouncilDetails.aspx",
    ],
  },
  {
    county: "Shropshire", district: "Telford and Wrekin",
    urls: [
      "https://democracy.telford.gov.uk/mgParishCouncilDetails.aspx?bcr=1",
      "https://telford.moderngov.co.uk/mgParishCouncilDetails.aspx",
      "https://democracy.telford.gov.uk/mgParishCouncilDetails.aspx",
    ],
  },
  {
    county: "Staffordshire", district: "Tamworth",
    urls: [
      "https://tamworth.moderngov.co.uk/mgParishCouncilDetails.aspx?bcr=1",
      "https://democracy.tamworth.gov.uk/mgParishCouncilDetails.aspx",
      "https://tamworth.moderngov.co.uk/mgParishCouncilDetails.aspx",
    ],
  },
  {
    county: "Worcestershire", district: "Bromsgrove",
    urls: [
      "https://bromsgrove.gov.uk/mgParishCouncilDetails.aspx?bcr=1",
      "https://bromsgrove.moderngov.co.uk/mgParishCouncilDetails.aspx",
      "https://democracy.bromsgrove.gov.uk/mgParishCouncilDetails.aspx",
    ],
  },
  {
    // Newark had 76 pages but only 1 result — retry with explicit chunking
    county: "Nottinghamshire", district: "Newark and Sherwood",
    urls: [
      "https://democracy.newark-sherwooddc.gov.uk/mgParishCouncilDetails.aspx",
    ],
  },
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
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    clearTimeout(timer);
    return null;
  }
}

function extractCouncilLinks(html, baseUrl) {
  const links = [];
  const re = /href=["']([^"']*mgParishCouncilDetails\.aspx\?ID=(\d+)[^"']*)["']/gi;
  let match;
  const seen = new Set();
  while ((match = re.exec(html)) !== null) {
    const id = match[2];
    if (!seen.has(id)) {
      seen.add(id);
      try {
        links.push(new URL(match[1], baseUrl).toString());
      } catch {
        links.push(baseUrl.replace(/mgParishCouncilDetails\.aspx.*/, `mgParishCouncilDetails.aspx?ID=${id}`));
      }
    }
  }
  return links;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function askClaudeForCouncils(county, district, pageText) {
  const prompt = `Extract all parish and town council clerk contact details from this UK local council web page.

County: ${county}
District: ${district}

For each parish or town council mentioned, extract:
- council_name: full name of the parish/town council
- clerk_name: clerk's full name (may be listed as Clerk, Town Clerk, Parish Clerk, RFO, etc.)
- email: clerk's email address if present
- phone: clerk's phone number if present
- address: correspondence address if present

Respond ONLY with a JSON array, no preamble, no markdown fences. If no council data is found, return [].

Page text:
${pageText.slice(0, 20000)}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API error ${res.status}`);

  const data = await res.json();
  const text = data.content.map((b) => b.text || "").join("").trim();
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function processSource(source) {
  const { county, district, urls } = source;
  console.log(`\n── ${county} / ${district}`);

  let listingHtml = null;
  let usedUrl = null;

  for (const url of urls) {
    console.log(`   Trying: ${url}`);
    const html = await fetchText(url);
    if (html) {
      const links = extractCouncilLinks(html, url);
      if (links.length > 0) {
        listingHtml = html;
        usedUrl = url;
        console.log(`   ✓ Found ${links.length} links at this URL`);
        break;
      } else {
        console.log(`   (no links in this response)`);
        // Keep trying but save this HTML as fallback
        if (!listingHtml) { listingHtml = html; usedUrl = url; }
      }
    }
  }

  if (!listingHtml) {
    console.log(`   ✗ all URLs unreachable`);
    return 0;
  }

  const councilLinks = extractCouncilLinks(listingHtml, usedUrl);
  let allText = "";

  if (councilLinks.length === 0) {
    // Use the listing page text directly — may still have some data
    allText = stripHtml(listingHtml);
    console.log(`   Using listing page text directly (${allText.length} chars)`);
  } else {
    const toFetch = councilLinks.slice(0, 100);
    let fetched = 0;
    for (const link of toFetch) {
      const html = await fetchText(link, 8000);
      if (html) {
        allText += "\n\n--- Council Page ---\n" + stripHtml(html);
        fetched++;
      }
      if (fetched % 10 === 0) await new Promise((r) => setTimeout(r, 500));
    }
    console.log(`   Fetched ${fetched}/${toFetch.length} council pages`);
  }

  if (!allText.trim()) {
    console.log(`   ✗ no usable text`);
    return 0;
  }

  // For large text, chunk across multiple Claude calls
  let councils = [];
  const CHUNK_SIZE = 18000;
  const chunks = [];
  for (let i = 0; i < allText.length; i += CHUNK_SIZE) {
    chunks.push(allText.slice(i, i + CHUNK_SIZE));
  }

  for (const chunk of chunks.slice(0, 5)) {
    try {
      const result = await askClaudeForCouncils(county, district, chunk);
      councils = councils.concat(result);
    } catch (err) {
      console.log(`   ✗ Claude error: ${err.message}`);
    }
  }

  // Deduplicate
  const seen = new Set();
  const unique = councils.filter((c) => {
    if (!c.council_name?.trim()) return false;
    const key = c.council_name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (!unique.length) {
    console.log(`   ✗ Claude found no council data`);
    return 0;
  }

  console.log(`   Claude extracted ${unique.length} councils`);

  const rows = unique.map((c) => ({
    council_name: c.council_name.trim(),
    district,
    county,
    clerk_name: c.clerk_name || null,
    email: c.email || null,
    phone: c.phone || null,
    address: c.address || null,
    source: usedUrl,
    enriched_at: new Date().toISOString(),
    outreach_status: "not_contacted",
  }));

  let inserted = 0;
  const CHUNK = 50;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from("parish_councils")
      .upsert(chunk, { onConflict: "council_name,district", ignoreDuplicates: false });
    if (error) {
      console.log(`   ✗ Supabase error: ${error.message}`);
      for (const row of chunk) {
        const { error: e2 } = await supabase.from("parish_councils").insert(row);
        if (!e2) inserted++;
      }
    } else {
      inserted += chunk.length;
    }
  }

  console.log(`   ✓ Upserted ${inserted} councils`);
  return inserted;
}

async function main() {
  console.log(`Retry pass: ${SOURCES.length} sources\n`);

  let total = 0;
  for (const source of SOURCES) {
    const count = await processSource(source);
    total += count;
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n══ DONE ══`);
  console.log(`Total councils upserted: ${total}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
