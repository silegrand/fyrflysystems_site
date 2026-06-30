// scripts/discover-sources-midlands-east.mjs
//
// Probes common ModernGov URL patterns for 80 districts across the
// Midlands and East of England (excluding Hertfordshire and Essex which
// are already in parish_councils). Writes a discovery-report-midlands-east.json
// artifact so we can see which URLs returned parish council data before
// building enrichment batches.
//
// Regions covered:
//   East of England (remaining): Cambridgeshire, Norfolk, Suffolk, Bedfordshire
//   East Midlands: Derbyshire, Leicestershire, Lincolnshire,
//                  Northamptonshire, Nottinghamshire
//   West Midlands: Shropshire, Staffordshire, Warwickshire, Worcestershire

import { writeFile } from "node:fs/promises";

const TARGETS = [
  // ── EAST OF ENGLAND ──────────────────────────────────────────────────
  { county: "Cambridgeshire", district: "Cambridge" },
  { county: "Cambridgeshire", district: "East Cambridgeshire" },
  { county: "Cambridgeshire", district: "Fenland" },
  { county: "Cambridgeshire", district: "Huntingdonshire" },
  { county: "Cambridgeshire", district: "South Cambridgeshire" },
  { county: "Cambridgeshire", district: "Peterborough" },

  { county: "Norfolk", district: "Breckland" },
  { county: "Norfolk", district: "Broadland" },
  { county: "Norfolk", district: "Great Yarmouth" },
  { county: "Norfolk", district: "Kings Lynn and West Norfolk" },
  { county: "Norfolk", district: "North Norfolk" },
  { county: "Norfolk", district: "Norwich" },
  { county: "Norfolk", district: "South Norfolk" },

  { county: "Suffolk", district: "Babergh" },
  { county: "Suffolk", district: "East Suffolk" },
  { county: "Suffolk", district: "Ipswich" },
  { county: "Suffolk", district: "Mid Suffolk" },
  { county: "Suffolk", district: "West Suffolk" },

  { county: "Bedfordshire", district: "Bedford" },
  { county: "Bedfordshire", district: "Central Bedfordshire" },
  { county: "Bedfordshire", district: "Luton" },

  // ── EAST MIDLANDS ─────────────────────────────────────────────────────
  { county: "Derbyshire", district: "Amber Valley" },
  { county: "Derbyshire", district: "Bolsover" },
  { county: "Derbyshire", district: "Chesterfield" },
  { county: "Derbyshire", district: "Derbyshire Dales" },
  { county: "Derbyshire", district: "Erewash" },
  { county: "Derbyshire", district: "High Peak" },
  { county: "Derbyshire", district: "North East Derbyshire" },
  { county: "Derbyshire", district: "South Derbyshire" },
  { county: "Derbyshire", district: "Derby" },

  { county: "Leicestershire", district: "Blaby" },
  { county: "Leicestershire", district: "Charnwood" },
  { county: "Leicestershire", district: "Harborough" },
  { county: "Leicestershire", district: "Hinckley and Bosworth" },
  { county: "Leicestershire", district: "Melton" },
  { county: "Leicestershire", district: "North West Leicestershire" },
  { county: "Leicestershire", district: "Oadby and Wigston" },
  { county: "Leicestershire", district: "Leicester" },
  { county: "Leicestershire", district: "Rutland" },

  { county: "Lincolnshire", district: "Boston" },
  { county: "Lincolnshire", district: "East Lindsey" },
  { county: "Lincolnshire", district: "Lincoln" },
  { county: "Lincolnshire", district: "North Kesteven" },
  { county: "Lincolnshire", district: "South Holland" },
  { county: "Lincolnshire", district: "South Kesteven" },
  { county: "Lincolnshire", district: "West Lindsey" },
  { county: "Lincolnshire", district: "North Lincolnshire" },
  { county: "Lincolnshire", district: "North East Lincolnshire" },

  { county: "Northamptonshire", district: "North Northamptonshire" },
  { county: "Northamptonshire", district: "West Northamptonshire" },

  { county: "Nottinghamshire", district: "Ashfield" },
  { county: "Nottinghamshire", district: "Basford" },
  { county: "Nottinghamshire", district: "Broxtowe" },
  { county: "Nottinghamshire", district: "Gedling" },
  { county: "Nottinghamshire", district: "Mansfield" },
  { county: "Nottinghamshire", district: "Newark and Sherwood" },
  { county: "Nottinghamshire", district: "Rushcliffe" },
  { county: "Nottinghamshire", district: "Nottingham" },

  // ── WEST MIDLANDS ─────────────────────────────────────────────────────
  { county: "Shropshire", district: "Shropshire" },
  { county: "Shropshire", district: "Telford and Wrekin" },

  { county: "Staffordshire", district: "Cannock Chase" },
  { county: "Staffordshire", district: "East Staffordshire" },
  { county: "Staffordshire", district: "Lichfield" },
  { county: "Staffordshire", district: "Newcastle-under-Lyme" },
  { county: "Staffordshire", district: "South Staffordshire" },
  { county: "Staffordshire", district: "Stafford" },
  { county: "Staffordshire", district: "Staffordshire Moorlands" },
  { county: "Staffordshire", district: "Tamworth" },
  { county: "Staffordshire", district: "Stoke-on-Trent" },

  { county: "Warwickshire", district: "North Warwickshire" },
  { county: "Warwickshire", district: "Nuneaton and Bedworth" },
  { county: "Warwickshire", district: "Rugby" },
  { county: "Warwickshire", district: "Stratford-on-Avon" },
  { county: "Warwickshire", district: "Warwick" },

  { county: "Worcestershire", district: "Bromsgrove" },
  { county: "Worcestershire", district: "Malvern Hills" },
  { county: "Worcestershire", district: "Redditch" },
  { county: "Worcestershire", district: "Worcester" },
  { county: "Worcestershire", district: "Wychavon" },
  { county: "Worcestershire", district: "Wyre Forest" },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\s+and\s+/gi, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function urlPatterns(district) {
  const s = slugify(district);
  return [
    `https://${s}.moderngov.co.uk/mgParishCouncilDetails.aspx`,
    `https://democracy.${s}.gov.uk/mgParishCouncilDetails.aspx`,
    `https://meetings.${s}.gov.uk/mgParishCouncilDetails.aspx`,
    `https://services.${s}.gov.uk/meetings/mgParishCouncilDetails.aspx`,
    `https://${s}.gov.uk/mgParishCouncilDetails.aspx`,
    `https://committees.${s}.gov.uk/mgParishCouncilDetails.aspx`,
    `https://modgov.${s}.gov.uk/mgParishCouncilDetails.aspx`,
    `https://mgov.${s}.gov.uk/mgParishCouncilDetails.aspx`,
  ];
}

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

async function main() {
  const report = [];
  let i = 0;

  for (const { county, district } of TARGETS) {
    i++;
    const patterns = urlPatterns(district);
    console.log(`[${i}/${TARGETS.length}] ${county} / ${district}`);
    const results = [];
    let found = false;

    for (const url of patterns) {
      const r = await probe(url);
      results.push(r);
      if (r.ok && r.hasCouncils) {
        console.log(`  ✓ ${url}`);
        found = true;
        break; // stop at first hit
      }
    }

    if (!found) {
      // Try a broader set of patterns if none matched
      const extra = [
        `https://www.${slugify(district)}.gov.uk/mgParishCouncilDetails.aspx`,
        `https://portal.${slugify(district)}.gov.uk/mgParishCouncilDetails.aspx`,
      ];
      for (const url of extra) {
        const r = await probe(url);
        results.push(r);
        if (r.ok && r.hasCouncils) {
          console.log(`  ✓ ${url} (extended pattern)`);
          found = true;
          break;
        }
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
  console.log(`\nDone. ${hits}/${TARGETS.length} districts found a ModernGov parish URL.`);

  await writeFile(
    "discovery-report-midlands-east.json",
    JSON.stringify(report, null, 2)
  );
  console.log("Written: discovery-report-midlands-east.json");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
