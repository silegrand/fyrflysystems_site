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
  // East Sussex
  { county: "East Sussex", district: "Eastbourne" },
  { county: "East Sussex", district: "Hastings" },
  { county: "East Sussex", district: "Lewes" },
  { county: "East Sussex", district: "Rother" },
  { county: "East Sussex", district: "Wealden" },
  // West Sussex (remaining — Horsham, Arun, Chichester already confirmed manually)
  { county: "West Sussex", district: "Adur" },
  { county: "West Sussex", district: "Worthing" },
  { county: "West Sussex", district: "Crawley" },
  { county: "West Sussex", district: "Mid Sussex" },
  // Surrey (remaining — Guildford, Reigate & Banstead, Sevenoaks-adjacent already confirmed)
  { county: "Surrey", district: "Elmbridge" },
  { county: "Surrey", district: "Epsom and Ewell" },
  { county: "Surrey", district: "Mole Valley" },
  { county: "Surrey", district: "Runnymede" },
  { county: "Surrey", district: "Spelthorne" },
  { county: "Surrey", district: "Surrey Heath" },
  { county: "Surrey", district: "Tandridge" },
  { county: "Surrey", district: "Waverley" },
  { county: "Surrey", district: "Woking" },
  // Berkshire unitary authorities
  { county: "Berkshire", district: "West Berkshire" },
  { county: "Berkshire", district: "Reading" },
  { county: "Berkshire", district: "Wokingham" },
  { county: "Berkshire", district: "Bracknell Forest" },
  { county: "Berkshire", district: "Windsor and Maidenhead" },
  { county: "Berkshire", district: "Slough" },
  // Buckinghamshire (unitary since 2020)
  { county: "Buckinghamshire", district: "Buckinghamshire" },
  // Hertfordshire
  { county: "Hertfordshire", district: "Broxbourne" },
  { county: "Hertfordshire", district: "Dacorum" },
  { county: "Hertfordshire", district: "East Hertfordshire" },
  { county: "Hertfordshire", district: "Hertsmere" },
  { county: "Hertfordshire", district: "North Hertfordshire" },
  { county: "Hertfordshire", district: "St Albans" },
  { county: "Hertfordshire", district: "Stevenage" },
  { county: "Hertfordshire", district: "Three Rivers" },
  { county: "Hertfordshire", district: "Watford" },
  { county: "Hertfordshire", district: "Welwyn Hatfield" },
  // Essex
  { county: "Essex", district: "Basildon" },
  { county: "Essex", district: "Braintree" },
  { county: "Essex", district: "Brentwood" },
  { county: "Essex", district: "Castle Point" },
  { county: "Essex", district: "Chelmsford" },
  { county: "Essex", district: "Colchester" },
  { county: "Essex", district: "Epping Forest" },
  { county: "Essex", district: "Harlow" },
  { county: "Essex", district: "Maldon" },
  { county: "Essex", district: "Rochford" },
  { county: "Essex", district: "Tendring" },
  { county: "Essex", district: "Uttlesford" },
  { county: "Essex", district: "Southend-on-Sea" },
  { county: "Essex", district: "Thurrock" },
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
