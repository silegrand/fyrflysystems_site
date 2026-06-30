// scripts/load-south-east-state-schools-batch1.mjs
//
// One-off loader: reads data/south-east-state-schools.json (1,361 GIAS
// records covering mainstream state-funded primary/secondary/all-through
// schools across Surrey, East Sussex, West Sussex, Essex, and Brighton &
// Hove) and upserts them into the south_east_state_schools table in
// Supabase. Upsert key is `urn` so this is safe to re-run.

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
    new URL("../data/south-east-state-schools.json", import.meta.url),
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
    county: s.county,
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

  const CHUNK = 100;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from("south_east_state_schools")
      .upsert(chunk, { onConflict: "urn", count: "exact" });

    if (error) {
      console.error(`Error on chunk starting at index ${i}:`, error);
      process.exit(1);
    }

    inserted += chunk.length;
    console.log(`Upserted rows ${i + 1}-${i + chunk.length} (${inserted}/${rows.length})`);
  }

  console.log(`Done. Upserted ${inserted} South East state schools.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
