// Batch 2 — parish council enrichment
// Confirmed via discover-sources.mjs. Fetches ModernGov "full contact
// information" pages, uses Claude to extract structured records, and
// inserts into Supabase.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
  console.error("Missing required environment variables. Check repo secrets.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Confirmed sources from the discovery script run.
const SOURCES = [
  { county: "East Sussex", district: "Eastbourne", url: "https://eastbourne.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "East Sussex", district: "Hastings", url: "https://hastings.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "East Sussex", district: "Rother", url: "https://rother.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "West Sussex", district: "Crawley", url: "https://crawley.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "West Sussex", district: "Mid Sussex", url: "https://midsussex.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Surrey", district: "Runnymede", url: "https://runnymede.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Surrey", district: "Spelthorne", url: "https://democracy.spelthorne.gov.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Surrey", district: "Surrey Heath", url: "https://surreyheath.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Surrey", district: "Tandridge", url: "https://tandridge.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Surrey", district: "Woking", url: "https://woking.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Berkshire", district: "Reading", url: "https://reading.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Berkshire", district: "Wokingham", url: "https://wokingham.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Berkshire", district: "Bracknell Forest", url: "https://bracknell-forest.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Berkshire", district: "Slough", url: "https://slough.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Buckinghamshire", district: "Buckinghamshire", url: "https://buckinghamshire.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Hertfordshire", district: "Broxbourne", url: "https://broxbourne.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Hertfordshire", district: "Hertsmere", url: "https://hertsmere.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Hertfordshire", district: "St Albans", url: "https://stalbans.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Hertfordshire", district: "Stevenage", url: "https://democracy.stevenage.gov.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Hertfordshire", district: "Watford", url: "https://watford.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Essex", district: "Brentwood", url: "https://brentwood.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Essex", district: "Epping Forest", url: "https://eppingforest.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Essex", district: "Harlow", url: "https://harlow.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Essex", district: "Maldon", url: "https://democracy.maldon.gov.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Essex", district: "Rochford", url: "https://rochford.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Essex", district: "Uttlesford", url: "https://uttlesford.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Essex", district: "Thurrock", url: "https://thurrock.moderngov.co.uk/mgParishCouncilDetailsList.aspx" },
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
