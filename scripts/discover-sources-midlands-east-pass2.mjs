// scripts/discover-sources-midlands-east-pass2.mjs
//
// Second-pass discovery: tries known alternative ModernGov slug patterns
// for the 48 districts that didn't match in the first pass (excluding 8
// urban unitaries that genuinely have no parish council lists).
// Writes discovery-report-midlands-east-pass2.json as a GitHub Actions artifact.

import { writeFile } from "node:fs/promises";

// Each entry has the county/district label plus a set of specific URLs to try
// (derived from common council abbreviation patterns).
const TARGETS = [
  { county: "Cambridgeshire", district: "East Cambridgeshire", slugs: ["eastcambs", "east-cambs", "eastcambridgeshire"] },
  { county: "Cambridgeshire", district: "Fenland", slugs: ["fenland", "fenlandc"] },
  { county: "Cambridgeshire", district: "Huntingdonshire", slugs: ["huntingdonshire", "huntsdc"] },
  { county: "Cambridgeshire", district: "South Cambridgeshire", slugs: ["scambs", "southcambs", "south-cambs"] },

  { county: "Norfolk", district: "Breckland", slugs: ["breckland", "brecklanddc"] },
  { county: "Norfolk", district: "Broadland", slugs: ["broadland"] },
  { county: "Norfolk", district: "Great Yarmouth", slugs: ["greatyarmouth", "great-yarmouth"] },
  { county: "Norfolk", district: "Kings Lynn and West Norfolk", slugs: ["west-norfolk", "klwn", "westnorfolk"] },
  { county: "Norfolk", district: "North Norfolk", slugs: ["north-norfolk", "northnorfolk"] },
  { county: "Norfolk", district: "South Norfolk", slugs: ["south-norfolk", "southnorfolk"] },

  { county: "Suffolk", district: "Babergh", slugs: ["babergh"] },
  { county: "Suffolk", district: "East Suffolk", slugs: ["eastsuffolk", "east-suffolk"] },
  { county: "Suffolk", district: "Mid Suffolk", slugs: ["midsuffolk", "mid-suffolk"] },
  { county: "Suffolk", district: "West Suffolk", slugs: ["westsuffolk", "west-suffolk"] },

  { county: "Bedfordshire", district: "Bedford", slugs: ["bedford"] },
  { county: "Bedfordshire", district: "Central Bedfordshire", slugs: ["centralbedfordshire", "central-bedfordshire", "centralbeds"] },

  { county: "Derbyshire", district: "Amber Valley", slugs: ["ambervalley", "amber-valley"] },
  { county: "Derbyshire", district: "North East Derbyshire", slugs: ["ne-derbyshire", "northeastderbyshire", "nedc"] },
  { county: "Derbyshire", district: "South Derbyshire", slugs: ["south-derbyshire", "southderbyshire"] },

  { county: "Leicestershire", district: "Harborough", slugs: ["harborough"] },
  { county: "Leicestershire", district: "Hinckley and Bosworth", slugs: ["hinckley-bosworth", "hinckleybosworth"] },
  { county: "Leicestershire", district: "North West Leicestershire", slugs: ["nwleicestershire", "nwleics"] },
  { county: "Leicestershire", district: "Oadby and Wigston", slugs: ["oadby-wigston", "oadbywigston"] },
  { county: "Leicestershire", district: "Rutland", slugs: ["rutland"] },

  { county: "Lincolnshire", district: "East Lindsey", slugs: ["e-lindsey", "eastlindsey", "east-lindsey"] },
  { county: "Lincolnshire", district: "North Kesteven", slugs: ["n-kesteven", "northkesteven", "north-kesteven"] },
  { county: "Lincolnshire", district: "South Holland", slugs: ["sholland", "south-holland", "southholland"] },
  { county: "Lincolnshire", district: "West Lindsey", slugs: ["west-lindsey", "westlindsey"] },
  { county: "Lincolnshire", district: "North East Lincolnshire", slugs: ["nelincs", "ne-lincs", "northeastlincolnshire"] },

  { county: "Northamptonshire", district: "North Northamptonshire", slugs: ["northnorthants", "northnorthamptonshire"] },
  { county: "Northamptonshire", district: "West Northamptonshire", slugs: ["westnorthants", "westnorthamptonshire"] },

  { county: "Nottinghamshire", district: "Newark and Sherwood", slugs: ["newark-sherwooddc", "newark", "newarkandsherwooddc"] },

  { county: "Shropshire", district: "Shropshire", slugs: ["shropshire"] },
  { county: "Shropshire", district: "Telford and Wrekin", slugs: ["telford", "telfordandwrekin"] },

  { county: "Staffordshire", district: "Cannock Chase", slugs: ["cannockchasedc", "cannock-chase"] },
  { county: "Staffordshire", district: "East Staffordshire", slugs: ["eaststaffordshire", "east-staffs"] },
  { county: "Staffordshire", district: "Newcastle-under-Lyme", slugs: ["newcastle-staffs", "newcastleunderlyme"] },
  { county: "Staffordshire", district: "South Staffordshire", slugs: ["sstaffs", "southstaffordshire"] },
  { county: "Staffordshire", district: "Stafford", slugs: ["staffordbc", "stafford"] },
  { county: "Staffordshire", district: "Staffordshire Moorlands", slugs: ["staffsmoorlands", "staffordshire-moorlands"] },

  { county: "Warwickshire", district: "Nuneaton and Bedworth", slugs: ["nuneatonandbedworth", "nuneaton-bedworth"] },
  { county: "Warwickshire", district: "Rugby", slugs: ["rugby", "rugbybc"] },
  { county: "Warwickshire", district: "Stratford-on-Avon", slugs: ["stratford", "stratford-on-avon", "stratforddc"] },
  { county: "Warwickshire", district: "Warwick", slugs: ["warwickdc", "warwick"] },

  { county: "Worcestershire", district: "Malvern Hills", slugs: ["malvernhills", "malvern-hills"] },
  { county: "Worcestershire", district: "Redditch", slugs: ["redditch"] },
  { county: "Worcestershire", district: "Worcester", slugs: ["worcester", "worcestercc"] },
  { county: "Worcestershire", district: "Wyre Forest", slugs: ["wyreforest", "wyre-forest"] },
];

const UA = "Mozilla/5.0 (compatible; FyrflyProspectBot/1.0; +https://fyrflysystems.com)";

async function probe(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return { url, status: res.status, ok: false };
    const text = await res.text();
    const hasCouncils =
      text.includes("Parish") ||
      text.includes("Town Council") ||
      text.includes("Community Council") ||
      text.includes("mgParishCouncil");
    return { url, status: res.status, ok: true, hasCouncils };
  } catch (err) {
    return { url, status: 0, ok: false, error: String(err).slice(0, 80) };
  }
}

function buildUrls(slugs) {
  const urls = [];
  for (const s of slugs) {
    urls.push(`https://${s}.moderngov.co.uk/mgParishCouncilDetails.aspx`);
    urls.push(`https://democracy.${s}.gov.uk/mgParishCouncilDetails.aspx`);
    urls.push(`https://meetings.${s}.gov.uk/mgParishCouncilDetails.aspx`);
    urls.push(`https://${s}.gov.uk/mgParishCouncilDetails.aspx`);
  }
  return [...new Set(urls)];
}

async function main() {
  const report = [];
  let i = 0;

  for (const { county, district, slugs } of TARGETS) {
    i++;
    console.log(`[${i}/${TARGETS.length}] ${county} / ${district}`);
    const urls = buildUrls(slugs);
    let found = false;
    const results = [];

    for (const url of urls) {
      const r = await probe(url);
      results.push(r);
      if (r.ok && r.hasCouncils) {
        console.log(`  ✓ ${url}`);
        found = true;
        break;
      }
    }

    if (!found) console.log(`  ✗ no match found`);

    report.push({
      county,
      district,
      found,
      hit: results.find((r) => r.ok && r.hasCouncils)?.url || null,
      results,
    });
  }

  const hits = report.filter((r) => r.found).length;
  console.log(`\nDone. ${hits}/${TARGETS.length} additional districts found.`);

  await writeFile(
    "discovery-report-midlands-east-pass2.json",
    JSON.stringify(report, null, 2)
  );
  console.log("Written: discovery-report-midlands-east-pass2.json");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
