// scripts/load-london-schools-full.mjs
//
// Loads all 2,241 mainstream state-funded schools across all 33 Greater
// London boroughs into the existing london_schools table.
//
// Uses ignoreDuplicates: true so the 185 records already enriched (with
// business_manager_name etc.) are left completely untouched — only new
// URNs get inserted. Safe to re-run.

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const raw = await readFile(
    new URL("../data/london-schools-full.json", import.meta.url),
    "utf-8"
  );
  const schools = JSON.parse(raw);
  console.log(`Loaded ${schools.length} records from JSON.`);

  const rows = schools.map((s) => ({
    urn: s.urn,
    school_name: s.school_name,
    school_type: s.school_type,
    type_group: s.type_group,
    phase: s.phase,
    gender: s.gender,
    borough: s.borough,
    town: s.town,
    postcode: s.postcode,
    website_url: s.website_url,
    phone: s.phone,
    pupil_count: s.pupil_count,
    head_title: s.head_title,
    head_first_name: s.head_first_name,
    head_last_name: s.head_last_name,
    head_job_title: s.head_job_title,
    website_status: s.website_url ? "not_checked" : "no_website",
    source: "GIAS",
  }));

  // Paginate fetch in chunks of 500 to avoid Supabase request size limits
  const CHUNK = 100;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { data, error } = await supabase
      .from("london_schools")
      .upsert(chunk, {
        onConflict: "urn",
        ignoreDuplicates: true,  // existing enriched records untouched
        count: "exact",
      });

    if (error) {
      console.error(`Error on chunk ${i}: ${error.message}`);
      process.exit(1);
    }

    inserted += chunk.length;
    if ((i / CHUNK) % 5 === 0 || i + CHUNK >= rows.length) {
      console.log(`Processed ${Math.min(i + CHUNK, rows.length)}/${rows.length}`);
    }
  }

  console.log(`\nDone. Processed ${inserted} records (existing enriched records were skipped).`);
  console.log(`london_schools table now covers all 33 Greater London boroughs.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
