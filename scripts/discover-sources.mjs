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
  // Hampshire
  { county: "Hampshire", district: "Basingstoke and Deane" },
  { county: "Hampshire", district: "East Hampshire" },
  { county: "Hampshire", district: "Eastleigh" },
  { county: "Hampshire", district: "Fareham" },
  { county: "Hampshire", district: "Gosport" },
  { county: "Hampshire", district: "Hart" },
  { county: "Hampshire", district: "Havant" },
  { county: "Hampshire", district: "New Forest" },
  { county: "Hampshire", district: "Rushmoor" },
  { county: "Hampshire", district: "Test Valley" },
  { county: "Hampshire", district: "Winchester" },
  { county: "Hampshire", district: "Portsmouth" },
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
  // Hertfordshire — retry of districts that didn't match first time
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
