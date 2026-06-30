// District council ModernGov discovery script
// Takes a list of district council names, tries common URL patterns,
// and reports which ones have a working "parish council contact list" page.
// Output: a JSON report you can review before feeding confirmed URLs
// into the enrichment script.

import { writeFileSync } from "fs";

// Districts to probe, grouped by county. Add more counties/districts here
// as we expand. Use the council's normal short name — the script will try
// slugified variants automatically.
const DISTRICTS = [
  // Hampshire — retry of misses
  { county: "Hampshire", district: "Basingstoke and Deane" },
  { county: "Hampshire", district: "East Hampshire" },
  { county: "Hampshire", district: "Southampton" },
  // Oxfordshire
  { county: "Oxfordshire", district: "Cherwell" },
  { county: "Oxfordshire", district: "Oxford" },
  { county: "Oxfordshire", district: "South Oxfordshire" },
  { county: "Oxfordshire", district: "Vale of White Horse" },
  { county: "Oxfordshire", district: "West Oxfordshire" },
  // Norfolk
  { county: "Norfolk", district: "Breckland" },
  { county: "Norfolk", district: "Broadland" },
  { county: "Norfolk", district: "Great Yarmouth" },
  { county: "Norfolk", district: "Kings Lynn and West Norfolk" },
  { county: "Norfolk", district: "North Norfolk" },
  { county: "Norfolk", district: "Norwich" },
  { county: "Norfolk", district: "South Norfolk" },
  // Suffolk
  { county: "Suffolk", district: "Babergh" },
  { county: "Suffolk", district: "East Suffolk" },
  { county: "Suffolk", district: "Ipswich" },
  { county: "Suffolk", district: "Mid Suffolk" },
  { county: "Suffolk", district: "West Suffolk" },
  // Hertfordshire — retry of misses
  { county: "Hertfordshire", district: "Dacorum" },
  { county: "Hertfordshire", district: "East Hertfordshire" },
  { county: "Hertfordshire", district: "North Hertfordshire" },
  { county: "Hertfordshire", district: "Three Rivers" },
  { county: "Hertfordshire", district: "Welwyn Hatfield" },
];

// Turn "East Hertfordshire" into "east-hertfordshire" and "easthertfordshire"
// (some councils use hyphens in their subdomain, some don't).
function slugVariants(name) {
  const lower = name.toLowerCase().trim();
  const hyphenated = lower.replace(/\s+/g, "-").replace(/&/g, "and");
  const squashed = lower.replace(/\s+/g, "").replace(/&/g, "and");
  return [...new Set([hyphenated, squashed])];
}

function candidateUrls(district) {
  const slugs = slugVariants(district);
  const urls = [];
  for (const slug of slugs) {
    urls.push(`https://${slug}.moderngov.co.uk/mgParishCouncilDetailsList.aspx`);
    urls.push(`https://democracy.${slug}.gov.uk/mgParishCouncilDetailsList.aspx`);
    urls.push(`https://meetings.${slug}.gov.uk/mgParishCouncilDetailsList.aspx`);
    urls.push(`https://services.${slug}.gov.uk/meetings/mgParishCouncilDetailsList.aspx`);
    urls.push(`https://${slug}.gov.uk/mgParishCouncilDetailsList.aspx`);
    urls.push(`https://committees.${slug}.gov.uk/mgParishCouncilDetailsList.aspx`);
    urls.push(`https://modgov.${slug}.gov.uk/mgParishCouncilDetailsList.aspx`);
    urls.push(`https://mgov.${slug}.gov.uk/mgParishCouncilDetailsList.aspx`);
  }
  return urls;
}

async function probeUrl(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "FyrflySystemsResearch/1.0 (+https://www.fyrflysystems.com)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    // A working parish list page should mention "Parish" and have reasonable length.
    // Pages that are just a 404/default ModernGov shell tend to be short.
    if (text.length > 2000 && /parish/i.test(text)) {
      return { ok: true, length: text.length };
    }
    return null;
  } catch {
    return null;
  }
}

async function main() {
  const results = [];

  for (const { county, district } of DISTRICTS) {
    console.log(`\n--- Probing ${district} (${county}) ---`);
    const candidates = candidateUrls(district);
    let found = null;

    for (const url of candidates) {
      process.stdout.write(`  trying ${url} ... `);
      const result = await probeUrl(url);
      if (result) {
        console.log(`MATCH (${result.length} chars)`);
        found = url;
        break;
      } else {
        console.log("no");
      }
    }

    results.push({
      county,
      district,
      url: found,
      status: found ? "confirmed" : "not_found",
    });
  }

  writeFileSync("discovery-report.json", JSON.stringify(results, null, 2));

  const confirmed = results.filter((r) => r.status === "confirmed");
  const notFound = results.filter((r) => r.status === "not_found");

  console.log(`\n=== Discovery complete ===`);
  console.log(`Confirmed: ${confirmed.length}`);
  confirmed.forEach((r) => console.log(`  ${r.district} (${r.county}): ${r.url}`));
  console.log(`\nNot found (needs manual check): ${notFound.length}`);
  notFound.forEach((r) => console.log(`  ${r.district} (${r.county})`));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
