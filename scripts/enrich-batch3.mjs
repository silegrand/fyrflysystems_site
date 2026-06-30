// Batch 3 — parish council enrichment
// Confirmed via discover-sources.mjs (Hampshire + scattered hits from
// Oxfordshire/Norfolk/Hertfordshire). Suffolk, most of Oxfordshire and
// Norfolk, and the remaining Hertfordshire districts did not match any
// known URL pattern and need manual investigation — they likely run a
// different committee management platform (not ModernGov).

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
  console.error("Missing required environment variables. Check repo secrets.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const SOURCES = [
  { county: "Hampshire", district: "Eastleigh", url: "https://eastleigh.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Hampshire", district: "Fareham", url: "https://fareham.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Hampshire", district: "Gosport", url: "https://gosport.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Hampshire", district: "Hart", url: "https://hart.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Hampshire", district: "Havant", url: "https://havant.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Hampshire", district: "New Forest", url: "https://democracy.newforest.gov.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Hampshire", district: "Rushmoor", url: "https://democracy.rushmoor.gov.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Hampshire", district: "Test Valley", url: "https://testvalley.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Hampshire", district: "Winchester", url: "https://winchester.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Hampshire", district: "Portsmouth", url: "https://portsmouth.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Hampshire", district: "Southampton", url: "https://modgov.southampton.gov.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Oxfordshire", district: "Cherwell", url: "https://modgov.cherwell.gov.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Norfolk", district: "North Norfolk", url: "https://modgov.north-norfolk.gov.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Hertfordshire", district: "Dacorum", url: "https://democracy.dacorum.gov.uk/mgParishCouncilDetailsList.aspx" },
];

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPageText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "FyrflySystemsResearch/1.0 (+https://www.fyrflysystems.com)" },
  });
  if (!res.ok) throw new Error(`Fetch failed (${res.status}) for ${url}`);
  const html = await res.text();
  return htmlToText(html);
}

async function extractRecords(district, county, pageText) {
  const prompt = `Below is the raw text of a UK district council's "parish council contact details" page for ${district}, ${county}.

Extract every individual PARISH or TOWN COUNCIL listed (not district/county officials, not association contacts) into a JSON array. For each one include:
- council_name (string)
- clerk_name (string or null — the clerk/contact person's name if given)
- email (string or null)
- phone (string or null)
- address (string or null)

Respond with ONLY the JSON array, no markdown fences, no commentary.

PAGE TEXT:
${pageText.slice(0, 15000)}`;

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
    throw new Error(`Claude API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const textBlock = data.content.find((c) => c.type === "text");
  if (!textBlock) throw new Error("No text content in Claude response");

  const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

async function main() {
  let totalUpserted = 0;
  let totalFailed = 0;

  for (const source of SOURCES) {
    console.log(`\n--- Processing ${source.district} (${source.county}) ---`);
    try {
      const pageText = await fetchPageText(source.url);
      console.log(`Fetched ${pageText.length} chars`);

      const records = await extractRecords(source.district, source.county, pageText);
      console.log(`Claude extracted ${records.length} council records`);

      const rows = records.map((r) => ({
        council_name: r.council_name,
        district: source.district,
        county: source.county,
        clerk_name: r.clerk_name || null,
        email: r.email || null,
        phone: r.phone || null,
        address: r.address || null,
        website_status: r.email || r.phone ? "contact_found" : "partial",
        source: source.url,
        enriched_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("parish_councils").insert(rows);

      if (error) {
        console.error(`Supabase insert error for ${source.district}:`, error.message);
        totalFailed += rows.length;
      } else {
        console.log(`Inserted ${rows.length} rows for ${source.district}`);
        totalUpserted += rows.length;
      }
    } catch (err) {
      console.error(`Failed processing ${source.district}:`, err.message);
      totalFailed += 1;
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n=== Done. Inserted: ${totalUpserted}, Failed: ${totalFailed} ===`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
