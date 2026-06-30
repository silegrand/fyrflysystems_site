// Kent test batch — parish council enrichment
// Fetches ModernGov "full contact information" pages for Kent districts,
// uses Claude to extract structured records, and upserts into Supabase.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
  console.error("Missing required environment variables. Check repo secrets.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Kent district councils running ModernGov, with their "full contact info" list page.
// Districts not on ModernGov are left out of this test batch — we'll handle them
// with a different source once we expand beyond Kent.
const SOURCES = [
  {
    district: "Ashford",
    url: "https://ashford.moderngov.co.uk/mgParishCouncilDetailsList.aspx",
  },
  {
    district: "Folkestone & Hythe",
    url: "https://folkestone-hythe.moderngov.co.uk/mgParishCouncilDetailsList.aspx",
  },
  {
    district: "Dartford",
    url: "https://dartford.moderngov.co.uk/mgParishCouncilDetailsList.aspx",
  },
];

// Strip HTML tags down to readable text, similar to what web_fetch returns.
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

// Ask Claude to extract structured parish council records from raw page text.
async function extractRecords(district, pageText) {
  const prompt = `Below is the raw text of a UK district council's "parish council contact details" page for ${district}, Kent.

Extract every individual PARISH or TOWN COUNCIL listed (not district/county officials, not KALC association contacts) into a JSON array. For each one include:
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
    console.log(`\n--- Processing ${source.district} ---`);
    try {
      const pageText = await fetchPageText(source.url);
      console.log(`Fetched ${pageText.length} chars`);

      const records = await extractRecords(source.district, pageText);
      console.log(`Claude extracted ${records.length} council records`);

      const rows = records.map((r) => ({
        council_name: r.council_name,
        district: source.district,
        county: "Kent",
        clerk_name: r.clerk_name || null,
        email: r.email || null,
        phone: r.phone || null,
        address: r.address || null,
        website_status: r.email || r.phone ? "contact_found" : "partial",
        source: source.url,
        enriched_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("parish_councils")
        .insert(rows);

      if (error) {
        console.error(`Supabase insert error for ${source.district}:`, error.message);
        totalFailed += rows.length;
      } else {
        console.log(`Upserted ${rows.length} rows for ${source.district}`);
        totalUpserted += rows.length;
      }
    } catch (err) {
      console.error(`Failed processing ${source.district}:`, err.message);
      totalFailed += 1;
    }

    // Small delay to be polite to source sites and avoid rate limits
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n=== Done. Upserted: ${totalUpserted}, Failed: ${totalFailed} ===`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
