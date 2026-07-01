// Planning Leads — daily collection via PlanIt API
// Queries planit.org.uk for large/major planning applications decided in the
// last 7 days across Kent, Essex, East Sussex, West Sussex, and London.
// Uses Claude to score each application for security system relevance,
// then inserts new records into Supabase (skipping duplicates).

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const AREAS = [
  { area: "kent", label: "Kent" },
  { area: "essex", label: "Essex" },
  { area: "east+sussex", label: "East Sussex" },
  { area: "west+sussex", label: "West Sussex" },
  { area: "greater+london", label: "Greater London" },
];

const LOOKBACK_DAYS = 7;

function getStartDate() {
  const d = new Date();
  d.setDate(d.getDate() - LOOKBACK_DAYS);
  return d.toISOString().split("T")[0];
}

async function fetchApplications(area, startDate) {
  const url =
    `https://www.planit.org.uk/api/applics/json?` +
    `auth=anonymous` +
    `&area=${area}` +
    `&start_date=${startDate}` +
    `&app_size=Large` +
    `&app_state=decided` +
    `&limit=100` +
    `&pg_sz=100`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "FyrflySystemsResearch/1.0 (+https://www.fyrflysystems.com)",
      "Accept": "application/json",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`PlanIt API error (${res.status}) for ${area}`);
  const data = await res.json();
  return data.objects || [];
}

async function scoreRelevance(description, address) {
  const prompt = `You are a business development assistant for Fyrfly Systems, a UK company that installs CCTV, access control, intruder alarms, and site security systems for commercial and public sector clients.

Assess whether the following planning application is likely to need a security system installation.

Address: ${address}
Description: ${description}

Score the relevance from 1-10 where:
1-3 = Unlikely to need security systems (e.g. domestic extension, single house, tree works, signage)
4-6 = Possible need (e.g. small commercial, change of use, small residential development)
7-10 = Strong need (e.g. commercial development, school, warehouse, industrial unit, large residential development, public building, multi-unit scheme, mixed use development)

Return a JSON object with:
- score (integer 1-10)
- relevance ("low", "medium", "high")
- reason (one sentence explaining the score)

Respond with ONLY the JSON object, no markdown fences, no commentary.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API error (${res.status})`);
  const data = await res.json();
  const textBlock = data.content.find((c) => c.type === "text");
  if (!textBlock) throw new Error("No text in Claude response");
  const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

function extractApplicantInfo(app) {
  return {
    applicant_name: app.applicant_name || null,
    applicant_company: app.applicant_company || null,
    agent_name: app.agent_name || null,
    agent_company: app.agent_company || null,
    agent_email: app.agent_email || null,
    agent_phone: app.agent_phone || null,
  };
}

async function main() {
  const startDate = getStartDate();
  console.log(`\nCollecting planning leads from ${startDate} onwards`);
  console.log(`Areas: ${AREAS.map((a) => a.label).join(", ")}\n`);

  let totalNew = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const { area, label } of AREAS) {
    console.log(`\n--- Fetching ${label} ---`);

    let applications;
    try {
      applications = await fetchApplications(area, startDate);
      console.log(`  Retrieved ${applications.length} large decided applications`);
    } catch (err) {
      console.error(`  Failed to fetch ${label}:`, err.message);
      totalFailed++;
      continue;
    }

    for (const app of applications) {
      const planitName = app.name || app.reference;
      if (!planitName) continue;

      const { data: existing } = await supabase
        .from("planning_leads")
        .select("id")
        .eq("planit_name", planitName)
        .single();

      if (existing) {
        totalSkipped++;
        continue;
      }

      let score = null;
      let relevance = "unscored";
      let reason = null;

      const description = app.description || "";
      const address = app.address || "";

      if (description) {
        try {
          const scoring = await scoreRelevance(description, address);
          score = scoring.score;
          relevance = scoring.relevance;
          reason = scoring.reason;
          process.stdout.write(`  [${score}/10 ${relevance}] ${address.slice(0, 50)}...\n`);
        } catch (err) {
          console.error(`  Scoring failed for ${planitName}:`, err.message);
        }
      }

      const contacts = extractApplicantInfo(app);

      const row = {
        planit_name: planitName,
        reference: app.uid || app.reference || null,
        authority_name: app.authority_name || null,
        area: label,
        address: address || null,
        postcode: app.postcode || null,
        description: description || null,
        app_size: app.app_size || "Large",
        app_type: app.app_type || null,
        app_state: app.app_state || null,
        decision: app.decided || null,
        decided_date: app.decided_date || null,
        start_date: app.start_date || null,
        ...contacts,
        lat: app.lat || null,
        lng: app.lng || null,
        source_url: app.source_url || null,
        planit_url: `https://www.planit.org.uk/planapplic/${planitName}/`,
        security_relevance: relevance,
        security_score: score,
        notes: reason || null,
      };

      const { error } = await supabase.from("planning_leads").insert(row);

      if (error) {
        if (error.code === "23505") {
          totalSkipped++;
        } else {
          console.error(`  Insert error for ${planitName}:`, error.message);
          totalFailed++;
        }
      } else {
        totalNew++;
      }

      await new Promise((r) => setTimeout(r, 500));
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n=== Done ===`);
  console.log(`New leads: ${totalNew}`);
  console.log(`Already existed (skipped): ${totalSkipped}`);
  console.log(`Failed: ${totalFailed}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
