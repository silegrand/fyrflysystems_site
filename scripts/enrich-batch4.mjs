// Batch 4 — parish council enrichment
// Remaining Surrey districts (Elmbridge, Waverley) plus Queen's Park
// Community Council — the only parish council in the whole of Greater
// London (all other London civil parishes were abolished in 1965).
// Epsom & Ewell has zero parish councils (confirmed) — nothing to add.
// Mole Valley uses a non-ModernGov custom page — left for manual follow-up.

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
  { county: "Surrey", district: "Elmbridge", url: "http://mygov.elmbridge.gov.uk/mgParishCouncilDetailsList.aspx" },
  { county: "Surrey", district: "Waverley", url: "https://modgov.waverley.gov.uk/mgParishCouncilDetailsList.aspx" },
];

// Queen's Park is a one-off — manually confirmed, no scraping needed.
const MANUAL_RECORDS = [
  {
    council_name: "Queen's Park Community Council",
    district: "Westminster",
    county: "Greater London",
    clerk_name: "The Clerk",
    email: "info@queensparkcommunitycouncil.gov.uk",
    phone: "0208 960 5644",
    address: "Queen's Park Community Centre, Beethoven Centre, Third Avenue, London W10 4JL",
    website_status: "contact_found",
    source: "https://committees.westminster.gov.uk/mgParishCouncilDetails.aspx?ID=492",
    enriched_at: new Date().toISOString(),
  },
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

  // Manual one-off record (Queen's Park)
  console.log(`\n--- Inserting manual record: Queen's Park Community Council ---`);
  const { error: manualError } = await supabase.from("parish_councils").insert(MANUAL_RECORDS);
  if (manualError) {
    console.error("Supabase insert error for Queen's Park:", manualError.message);
    totalFailed += 1;
  } else {
    console.log("Inserted 1 row for Queen's Park Community Council");
    totalUpserted += 1;
  }

  console.log(`\n=== Done. Inserted: ${totalUpserted}, Failed: ${totalFailed} ===`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
