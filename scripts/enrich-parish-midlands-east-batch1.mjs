// scripts/enrich-parish-midlands-east-batch1.mjs
//
// Enriches parish/town councils across 37 confirmed ModernGov sources
// covering the Midlands and East of England regions. For each district:
//   1. Fetches the ModernGov parish listing page to get individual council URLs
//   2. Fetches each council's detail page for clerk/contact info
//   3. Sends the text to Claude to extract {council_name, clerk_name, email, phone, address}
//   4. Upserts into the existing parish_councils table in Supabase
//
// Safe to re-run — upserts on council_name + district.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
  console.error("Missing required env vars.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const SOURCES = [
  // ── EAST OF ENGLAND ───────────────────────────────────────────────────
  { county: "Cambridgeshire", district: "Cambridge",           url: "https://democracy.cambridge.gov.uk/mgParishCouncilDetails.aspx" },
  { county: "Cambridgeshire", district: "South Cambridgeshire", url: "https://scambs.moderngov.co.uk/mgParishCouncilDetails.aspx" },
  { county: "Cambridgeshire", district: "Peterborough",        url: "https://peterborough.moderngov.co.uk/mgParishCouncilDetails.aspx" },
  { county: "Norfolk",        district: "Kings Lynn and West Norfolk", url: "https://democracy.west-norfolk.gov.uk/mgParishCouncilDetails.aspx" },
  { county: "Bedfordshire",   district: "Central Bedfordshire", url: "https://centralbeds.moderngov.co.uk/mgParishCouncilDetails.aspx" },

  // ── EAST MIDLANDS ──────────────────────────────────────────────────────
  { county: "Derbyshire",     district: "Bolsover",            url: "https://committees.bolsover.gov.uk/mgParishCouncilDetails.aspx" },
  { county: "Derbyshire",     district: "Chesterfield",        url: "https://chesterfield.moderngov.co.uk/mgParishCouncilDetails.aspx" },
  { county: "Derbyshire",     district: "Derbyshire Dales",    url: "https://derbyshiredales.moderngov.co.uk/mgParishCouncilDetails.aspx" },
  { county: "Derbyshire",     district: "Erewash",             url: "https://erewash.moderngov.co.uk/mgParishCouncilDetails.aspx" },
  { county: "Derbyshire",     district: "High Peak",           url: "https://highpeak.moderngov.co.uk/mgParishCouncilDetails.aspx" },
  { county: "Derbyshire",     district: "North East Derbyshire", url: "https://ne-derbyshire.moderngov.co.uk/mgParishCouncilDetails.aspx" },

  { county: "Leicestershire", district: "Blaby",               url: "https://democracy.blaby.gov.uk/mgParishCouncilDetails.aspx" },
  { county: "Leicestershire", district: "Charnwood",           url: "https://charnwood.moderngov.co.uk/mgParishCouncilDetails.aspx" },
  { county: "Leicestershire", district: "Melton",              url: "https://melton.moderngov.co.uk/mgParishCouncilDetails.aspx" },
  { county: "Leicestershire", district: "North West Leicestershire", url: "https://nwleics.moderngov.co.uk/mgParishCouncilDetails.aspx" },

  { county: "Lincolnshire",   district: "Boston",              url: "https://democracy.boston.gov.uk/mgParishCouncilDetails.aspx" },
  { county: "Lincolnshire",   district: "Lincoln",             url: "https://lincoln.moderngov.co.uk/mgParishCouncilDetails.aspx" },
  { county: "Lincolnshire",   district: "North Kesteven",      url: "https://democracy.n-kesteven.gov.uk/mgParishCouncilDetails.aspx" },
  { county: "Lincolnshire",   district: "North Lincolnshire",  url: "https://northlincolnshire.moderngov.co.uk/mgParishCouncilDetails.aspx" },
  { county: "Lincolnshire",   district: "South Holland",       url: "https://democracy.sholland.gov.uk/mgParishCouncilDetails.aspx" },
  { county: "Lincolnshire",   district: "South Kesteven",      url: "https://southkesteven.moderngov.co.uk/mgParishCouncilDetails.aspx" },
  { county: "Lincolnshire",   district: "West Lindsey",        url: "https://democracy.west-lindsey.gov.uk/mgParishCouncilDetails.aspx" },

  { county: "Northamptonshire", district: "North Northamptonshire", url: "https://northnorthants.moderngov.co.uk/mgParishCouncilDetails.aspx" },
  { county: "Northamptonshire", district: "West Northamptonshire",  url: "https://westnorthants.moderngov.co.uk/mgParishCouncilDetails.aspx" },

  { county: "Nottinghamshire", district: "Ashfield",           url: "https://ashfield.moderngov.co.uk/mgParishCouncilDetails.aspx" },
  { county: "Nottinghamshire", district: "Broxtowe",           url: "https://democracy.broxtowe.gov.uk/mgParishCouncilDetails.aspx" },
  { county: "Nottinghamshire", district: "Gedling",            url: "https://democracy.gedling.gov.uk/mgParishCouncilDetails.aspx" },
  { county: "Nottinghamshire", district: "Mansfield",          url: "https://mansfield.moderngov.co.uk/mgParishCouncilDetails.aspx" },
  { county: "Nottinghamshire", district: "Newark and Sherwood", url: "https://democracy.newark-sherwooddc.gov.uk/mgParishCouncilDetails.aspx" },
  { county: "Nottinghamshire", district: "Rushcliffe",         url: "https://democracy.rushcliffe.gov.uk/mgParishCouncilDetails.aspx" },

  // ── WEST MIDLANDS ──────────────────────────────────────────────────────
  { county: "Shropshire",     district: "Telford and Wrekin",  url: "https://democracy.telford.gov.uk/mgParishCouncilDetails.aspx" },

  { county: "Staffordshire",  district: "Lichfield",           url: "https://lichfield.moderngov.co.uk/mgParishCouncilDetails.aspx" },
  { county: "Staffordshire",  district: "Tamworth",            url: "https://tamworth.moderngov.co.uk/mgParishCouncilDetails.aspx" },

  { county: "Warwickshire",   district: "North Warwickshire",  url: "https://northwarwickshire.moderngov.co.uk/mgParishCouncilDetails.aspx" },
  { county: "Warwickshire",   district: "Stratford-on-Avon",   url: "https://democracy.stratford.gov.uk/mgParishCouncilDetails.aspx" },

  { county: "Worcestershire", district: "Bromsgrove",          url: "https://bromsgrove.gov.uk/mgParishCouncilDetails.aspx" },
  { county: "Worcestershire", district: "Wychavon",            url: "https://mgov.wychavon.gov.uk/mgParishCouncilDetails.aspx" },
];

const UA = "Mozilla/5.0 (compatible; FyrflyProspectBot/1.0; +https://fyrflysystems.com)";

async function fetchText(url, timeoutMs = 15000) {
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
  // ModernGov individual parish detail links: mgParishCouncilDetails.aspx?ID=NNN
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

Example:
[{"council_name":"Anytown Parish Council","clerk_name":"Jane Smith","email":"clerk@anytown.gov.uk","phone":"01234 567890","address":"1 High Street, Anytown AB1 2CD"}]

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

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API error ${res.status}: ${errText}`);
  }

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
  const { county, district, url } = source;
  console.log(`\n── ${county} / ${district}`);
  console.log(`   ${url}`);

  const listingHtml = await fetchText(url);
  if (!listingHtml) {
    console.log(`   ✗ listing page unreachable`);
    return 0;
  }

  // Try to extract individual council detail page links
  const councilLinks = extractCouncilLinks(listingHtml, url);
  console.log(`   Found ${councilLinks.length} individual council links`);

  let allText = "";

  if (councilLinks.length === 0) {
    // No individual links (likely JS-rendered menu) — extract from the listing
    // page itself plus try common sub-pages that list clerk details
    allText = stripHtml(listingHtml);
    // Also try the flat list view some ModernGov sites expose
    const listUrl = url.replace("mgParishCouncilDetails.aspx", "mgParishCouncilDetails.aspx?bcr=1");
    const listHtml = await fetchText(listUrl);
    if (listHtml) allText += "\n\n" + stripHtml(listHtml);
  } else {
    // Fetch each individual council page, with a hard cap and per-fetch timeout
    const toFetch = councilLinks.slice(0, 100);
    let fetched = 0;
    for (const link of toFetch) {
      const html = await fetchText(link, 8000);
      if (html) {
        allText += "\n\n--- Council Page ---\n" + stripHtml(html);
        fetched++;
      }
      // Brief pause every 10 fetches to avoid hammering the server
      if (fetched % 10 === 0) await new Promise((r) => setTimeout(r, 500));
    }
    console.log(`   Fetched ${fetched}/${toFetch.length} council pages`);
  }

  if (!allText.trim()) {
    console.log(`   ✗ no usable text extracted`);
    return 0;
  }

  // If the combined text is very large, send in two Claude calls and merge
  let councils = [];
  const CHUNK_SIZE = 20000;
  if (allText.length > CHUNK_SIZE) {
    const chunks = [];
    for (let i = 0; i < allText.length; i += CHUNK_SIZE) {
      chunks.push(allText.slice(i, i + CHUNK_SIZE));
    }
    for (const chunk of chunks.slice(0, 4)) { // max 4 Claude calls per district
      try {
        const result = await askClaudeForCouncils(county, district, chunk);
        councils = councils.concat(result);
      } catch (err) {
        console.log(`   ✗ Claude error on chunk: ${err.message}`);
      }
    }
  } else {
    try {
      councils = await askClaudeForCouncils(county, district, allText);
    } catch (err) {
      console.log(`   ✗ Claude error: ${err.message}`);
      return 0;
    }
  }

  if (!councils.length) {
    console.log(`   ✗ Claude found no council data`);
    return 0;
  }

  // Deduplicate by council_name
  const seen = new Set();
  const unique = councils.filter((c) => {
    if (!c.council_name || !c.council_name.trim()) return false;
    const key = c.council_name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`   Claude extracted ${unique.length} councils (deduplicated from ${councils.length})`);

  // Upsert in chunks
  const rows = unique.map((c) => ({
    council_name: c.council_name.trim(),
    district,
    county,
    clerk_name: c.clerk_name || null,
    email: c.email || null,
    phone: c.phone || null,
    address: c.address || null,
    source: url,
    enriched_at: new Date().toISOString(),
    outreach_status: "not_contacted",
  }));

  const DB_CHUNK = 50;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += DB_CHUNK) {
    const chunk = rows.slice(i, i + DB_CHUNK);
    const { error } = await supabase
      .from("parish_councils")
      .upsert(chunk, { onConflict: "council_name,district", ignoreDuplicates: false });
    if (error) {
      console.log(`   ✗ Supabase error on chunk ${i}: ${error.message}`);
      // Fall back to individual inserts if upsert fails
      for (const row of chunk) {
        const { error: e2 } = await supabase
          .from("parish_councils")
          .insert(row)
          .select();
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
  console.log(`Processing ${SOURCES.length} district sources...\n`);

  let totalInserted = 0;
  let totalSources = 0;

  for (const source of SOURCES) {
    const count = await processSource(source);
    totalInserted += count;
    if (count > 0) totalSources++;
    // Small pause between districts to be polite
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n══ DONE ══`);
  console.log(`Sources with data: ${totalSources}/${SOURCES.length}`);
  console.log(`Total councils upserted: ${totalInserted}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
