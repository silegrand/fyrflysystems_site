// NHS Trusts — South East test batch enrichment
// Pre-loaded with confirmed trust website URLs for the South East region.
// Fetches each trust's estates/facilities team page, uses Claude to extract
// the Director/Head of Estates contact details, and inserts into Supabase.
// Two-pass strategy: (1) estates team page, (2) FOI responses as fallback.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
  console.error("Missing required environment variables. Check repo secrets.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const TRUSTS = [
  {
    trust_name: "Dartford and Gravesham NHS Trust",
    trust_type: "Acute",
    region: "South East",
    county: "Kent",
    website_url: "https://www.dgt.nhs.uk",
    switchboard_phone: "01322 428100",
    trust_pages: ["/about-us/departments/estates-and-facilities", "/about-us/estates", "/foi/estates"],
  },
  {
    trust_name: "East Kent Hospitals NHS Foundation Trust",
    trust_type: "Acute",
    region: "South East",
    county: "Kent",
    website_url: "https://www.ekhuft.nhs.uk",
    switchboard_phone: "01227 766877",
    trust_pages: ["/patients-and-visitors/about-us/estates-and-facilities", "/about-us/estates", "/foi/estates"],
  },
  {
    trust_name: "Maidstone and Tunbridge Wells NHS Trust",
    trust_type: "Acute",
    region: "South East",
    county: "Kent",
    website_url: "https://www.mtw.nhs.uk",
    switchboard_phone: "01622 729000",
    trust_pages: ["/about-us/departments/estates-and-facilities", "/about-us/estates", "/foi/estates-department-staff-details-191023-docx"],
  },
  {
    trust_name: "Medway NHS Foundation Trust",
    trust_type: "Acute",
    region: "South East",
    county: "Kent",
    website_url: "https://www.medway.nhs.uk",
    switchboard_phone: "01634 830000",
    trust_pages: ["/about-us/departments/estates-and-facilities", "/about-us/estates", "/foi/estates"],
  },
  {
    trust_name: "Kent Community Health NHS Foundation Trust",
    trust_type: "Community",
    region: "South East",
    county: "Kent",
    website_url: "https://www.kchft.nhs.uk",
    switchboard_phone: "01233 618518",
    trust_pages: ["/about-us/departments/estates", "/about-us/estates-and-facilities", "/foi/estates"],
  },
  {
    trust_name: "Ashford and St Peter's Hospitals NHS Foundation Trust",
    trust_type: "Acute",
    region: "South East",
    county: "Surrey",
    website_url: "https://www.asph.nhs.uk",
    switchboard_phone: "01932 872000",
    trust_pages: ["/about-us/estates-and-facilities", "/about-us/departments/estates", "/foi/estates"],
  },
  {
    trust_name: "Royal Surrey NHS Foundation Trust",
    trust_type: "Acute",
    region: "South East",
    county: "Surrey",
    website_url: "https://www.royalsurrey.nhs.uk",
    switchboard_phone: "01483 571122",
    trust_pages: ["/about-us/departments/estates-and-facilities", "/about-us/estates", "/foi/estates"],
  },
  {
    trust_name: "Surrey and Sussex Healthcare NHS Trust",
    trust_type: "Acute",
    region: "South East",
    county: "Surrey",
    website_url: "https://www.surreyandsussex.nhs.uk",
    switchboard_phone: "01737 768511",
    trust_pages: ["/about-us/departments/estates", "/about-us/estates-and-facilities", "/foi/estates"],
  },
  {
    trust_name: "Frimley Health NHS Foundation Trust",
    trust_type: "Acute",
    region: "South East",
    county: "Surrey",
    website_url: "https://www.fhft.nhs.uk",
    switchboard_phone: "01276 604604",
    trust_pages: ["/about-us/departments/estates-and-facilities", "/about-us/estates", "/foi/estates"],
  },
  {
    trust_name: "East Sussex Healthcare NHS Trust",
    trust_type: "Acute",
    region: "South East",
    county: "East Sussex",
    website_url: "https://www.esht.nhs.uk",
    switchboard_phone: "01323 417400",
    trust_pages: ["/about-us/departments/estates", "/about-us/estates-and-facilities", "/foi/estates"],
  },
  {
    trust_name: "University Hospitals Sussex NHS Foundation Trust",
    trust_type: "Acute",
    region: "South East",
    county: "West Sussex",
    website_url: "https://www.uhsussex.nhs.uk",
    switchboard_phone: "01273 696955",
    trust_pages: ["/about-us/departments/estates-and-facilities", "/about-us/estates", "/foi/estates"],
  },
  {
    trust_name: "Queen Victoria Hospital NHS Foundation Trust",
    trust_type: "Specialist",
    region: "South East",
    county: "West Sussex",
    website_url: "https://www.qvh.nhs.uk",
    switchboard_phone: "01342 414000",
    trust_pages: ["/about-us/departments/estates", "/about-us/estates-and-facilities", "/foi/estates"],
  },
  {
    trust_name: "Sussex Community NHS Foundation Trust",
    trust_type: "Community",
    region: "South East",
    county: "West Sussex",
    website_url: "https://www.sussexcommunity.nhs.uk",
    switchboard_phone: "01273 696011",
    trust_pages: ["/about-us/departments/estates-and-facilities", "/about-us/estates", "/foi/estates"],
  },
  {
    trust_name: "Hampshire Hospitals NHS Foundation Trust",
    trust_type: "Acute",
    region: "South East",
    county: "Hampshire",
    website_url: "https://www.hampshirehospitals.nhs.uk",
    switchboard_phone: "01256 473202",
    trust_pages: ["/about-us/departments/estates-and-facilities", "/about-us/estates", "/foi/estates"],
  },
  {
    trust_name: "Isle of Wight NHS Trust",
    trust_type: "Acute",
    region: "South East",
    county: "Isle of Wight",
    website_url: "https://www.iow.nhs.uk",
    switchboard_phone: "01983 524081",
    trust_pages: ["/about-us/departments/estates-and-facilities", "/about-us/estates", "/foi/estates"],
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
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;
  const html = await res.text();
  const text = htmlToText(html);
  if (text.length < 500) return null;
  return text;
}

async function tryPages(baseUrl, paths) {
  for (const path of paths) {
    const url = baseUrl + path;
    process.stdout.write(`  trying ${url} ... `);
    try {
      const text = await fetchPageText(url);
      if (text && /estates|facilities|director|manager/i.test(text)) {
        console.log(`found (${text.length} chars)`);
        return { url, text };
      }
      console.log("no match");
    } catch {
      console.log("failed");
    }
  }
  return null;
}

async function extractContacts(trustName, pageText) {
  const prompt = `Below is text from the website of "${trustName}", an NHS trust in England.

Extract the estates or facilities leadership contacts. Look for job titles such as:
Director of Estates, Head of Estates, Director of Facilities, Estates Manager,
Head of Facilities, Director of Estates and Facilities, or similar senior roles.

Return a JSON object with these fields:
- estates_contact_name (string or null)
- estates_contact_title (string or null)
- estates_contact_email (string or null)
- estates_contact_phone (string or null)
- secondary_contact_name (string or null — deputy or facilities manager if listed)
- secondary_contact_title (string or null)
- secondary_contact_email (string or null)
- secondary_contact_phone (string or null)

If no estates/facilities contacts are found, return all fields as null.
Respond with ONLY the JSON object, no markdown fences, no commentary.

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
      max_tokens: 1000,
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
  let totalInserted = 0;
  let totalFailed = 0;

  for (const trust of TRUSTS) {
    console.log(`\n--- Processing: ${trust.trust_name} ---`);

    let contacts = {
      estates_contact_name: null,
      estates_contact_title: null,
      estates_contact_email: null,
      estates_contact_phone: null,
      secondary_contact_name: null,
      secondary_contact_title: null,
      secondary_contact_email: null,
      secondary_contact_phone: null,
    };

    let source = trust.website_url;
    let websiteStatus = "no_contact_found";

    try {
      const result = await tryPages(trust.website_url, trust.trust_pages);

      if (result) {
        contacts = await extractContacts(trust.trust_name, result.text);
        source = result.url;
        websiteStatus = contacts.estates_contact_name ? "contact_found" : "page_found_no_contact";
        console.log(`Extracted: ${contacts.estates_contact_name || "no name found"} — ${contacts.estates_contact_title || "no title"}`);
      } else {
        console.log("No estates page found — inserting with base details only");
        websiteStatus = "no_page_found";
      }
    } catch (err) {
      console.error(`Extraction error for ${trust.trust_name}:`, err.message);
      websiteStatus = "extraction_error";
    }

    const row = {
      trust_name: trust.trust_name,
      trust_type: trust.trust_type,
      region: trust.region,
      county: trust.county,
      website_url: trust.website_url,
      switchboard_phone: trust.switchboard_phone,
      address: null,
      ...contacts,
      website_status: websiteStatus,
      source,
      enriched_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("nhs_trusts").insert(row);

    if (error) {
      console.error(`Supabase insert error:`, error.message);
      totalFailed++;
    } else {
      console.log(`Inserted row for ${trust.trust_name}`);
      totalInserted++;
    }

    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\n=== Done. Inserted: ${totalInserted}, Failed: ${totalFailed} ===`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
