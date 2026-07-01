// Planning Leads — daily collection via PlanIt API
// Uses confirmed area_id values for each local authority.
// Fetches large/major applications decided in the last 14 days,
// scores each for security relevance via Claude, inserts into Supabase.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// PlanIt area_id values for each local authority in our target regions.
// Confirmed from live PlanIt data (Gravesham=142, Greenwich=304 etc).
// Full list cross-referenced from planit.org.uk/planarea/ pages.
const AUTHORITIES = [
  // Kent
  { area_id: 131, name: "Ashford", region: "Kent" },
  { area_id: 134, name: "Canterbury", region: "Kent" },
  { area_id: 137, name: "Dartford", region: "Kent" },
  { area_id: 138, name: "Dover", region: "Kent" },
  { area_id: 141, name: "Folkestone and Hythe", region: "Kent" },
  { area_id: 142, name: "Gravesham", region: "Kent" },
  { area_id: 199, name: "Maidstone", region: "Kent" },
  { area_id: 214, name: "Medway", region: "Kent" },
  { area_id: 234, name: "Sevenoaks", region: "Kent" },
  { area_id: 243, name: "Swale", region: "Kent" },
  { area_id: 248, name: "Thanet", region: "Kent" },
  { area_id: 250, name: "Tonbridge and Malling", region: "Kent" },
  { area_id: 252, name: "Tunbridge Wells", region: "Kent" },
  // Essex
  { area_id: 57,  name: "Basildon", region: "Essex" },
  { area_id: 58,  name: "Braintree", region: "Essex" },
  { area_id: 63,  name: "Brentwood", region: "Essex" },
  { area_id: 71,  name: "Castle Point", region: "Essex" },
  { area_id: 76,  name: "Chelmsford", region: "Essex" },
  { area_id: 77,  name: "Colchester", region: "Essex" },
  { area_id: 109, name: "Epping Forest", region: "Essex" },
  { area_id: 145, name: "Harlow", region: "Essex" },
  { area_id: 203, name: "Maldon", region: "Essex" },
  { area_id: 228, name: "Rochford", region: "Essex" },
  { area_id: 247, name: "Tendring", region: "Essex" },
  { area_id: 259, name: "Uttlesford", region: "Essex" },
  // East Sussex
  { area_id: 102, name: "Eastbourne", region: "East Sussex" },
  { area_id: 146, name: "Hastings", region: "East Sussex" },
  { area_id: 165, name: "Lewes", region: "East Sussex" },
  { area_id: 227, name: "Rother", region: "East Sussex" },
  { area_id: 268, name: "Wealden", region: "East Sussex" },
  // West Sussex
  { area_id: 4,   name: "Adur", region: "West Sussex" },
  { area_id: 75,  name: "Chichester", region: "West Sussex" },
  { area_id: 87,  name: "Crawley", region: "West Sussex" },
  { area_id: 152, name: "Horsham", region: "West Sussex" },
  { area_id: 207, name: "Mid Sussex", region: "West Sussex" },
  { area_id: 270, name: "Worthing", region: "West Sussex" },
  // London (selected boroughs — all 32 would be too broad for daily runs)
  { area_id: 51,  name: "Barking and Dagenham", region: "London" },
  { area_id: 52,  name: "Barnet", region: "London" },
  { area_id: 56,  name: "Bexley", region: "London" },
  { area_id: 64,  name: "Bromley", region: "London" },
  { area_id: 304, name: "Greenwich", region: "London" },
  { area_id: 161, name: "Lewisham", region: "London" },
  { area_id: 239, name: "Southwark", region: "London" },
  { area_id: 253, name: "Tower Hamlets", region: "London" },
  { area_id: 261, name: "Waltham Forest", region: "London" },
];

const LOOKBACK_DAYS = 14;

function getStartDate() {
  const d = new Date();
  d.setDate(d.getDate() - LOOKBACK_DAYS);
  return d.toISOString().split("T")[0];
}

async function fetchApplications(areaId, startDate) {
  const url =
    `https://www.planit.org.uk/api/applics/json?` +
    `area_id=${areaId}` +
    `&start_date=${startDate}` +
    `&app_size=Large` +
    `&limit=50` +
    `&pg_sz=50` +
    `&sort=start_date.desc`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "FyrflySystemsResearch/1.0 (+https://www.fyrflysystems.com)",
      "Accept": "application/json",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`PlanIt API error (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.objects || [];
}

async function scoreRelevance(description, address) {
  const prompt = `You are a business development assistant for Fyrfly Systems, a UK company that installs CCTV, access control, intruder alarms, and site security systems for commercial and public sector clients.

Assess whether the following planning application is likely to need a security system installation.

Address: ${address}
Description: ${description}

Score the relevance from 1-10 where:
1-3 = Unlikely to need security systems (domestic extension, single house, tree works, signage, fencing)
4-6 = Possible need (small commercial unit, change of use, small residential development of 5-20 units)
7-10 = Strong need (school, warehouse, industrial unit, large residential development 20+ units, public building, mixed use, commercial development, retail, office, care home, leisure)

Return a JSON object with exactly these fields:
- score (integer 1-10)
- relevance ("low", "medium", or "high")
- reason (one sentence)

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

async function main() {
  const startDate = getStartDate();
  console.log(`\nCollecting planning leads from ${startDate} onwards`);
  console.log(`Authorities: ${AUTHORITIES.length}\n`);

  let totalNew = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const authority of AUTHORITIES) {
    process.stdout.write(`Fetching ${authority.name} (${authority.region})... `);

    let applications;
    try {
      applications = await fetchApplications(authority.area_id, startDate);
      console.log(`${applications.length} applications`);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      totalFailed++;
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }

    for (const app of applications) {
      const planitName = app.name;
      if (!planitName) continue;

      // Skip duplicates
      try {
        const { data: existing } = await supabase
          .from("planning_leads")
          .select("id")
          .eq("planit_name", planitName)
          .maybeSingle();

        if (existing) { totalSkipped++; continue; }
      } catch {
        // If check fails, proceed anyway
      }

      const description = app.description || "";
      const address = app.address || "";
      let score = null;
      let relevance = "unscored";
      let reason = null;

      if (description) {
        try {
          const scoring = await scoreRelevance(description, address);
          score = scoring.score;
          relevance = scoring.relevance;
          reason = scoring.reason;
        } catch (err) {
          console.error(`  Scoring failed for ${planitName}: ${err.message}`);
        }
      }

      // Extract nested other_fields if present
      const other = app.other_fields || {};

      const row = {
        planit_name: planitName,
        reference: app.uid || null,
        authority_name: app.area_name || authority.name,
        area: authority.region,
        address: address || null,
        postcode: app.postcode || null,
        description: description || null,
        app_size: app.app_size || "Large",
        app_type: other.application_type || app.app_type || null,
        app_state: app.app_state || null,
        decision: other.decision || null,
        decided_date: other.decision_date || other.decided_date || null,
        start_date: app.start_date || null,
        applicant_name: other.applicant_name || null,
        applicant_company: other.applicant_company || null,
        agent_name: other.agent_name || null,
        agent_company: other.agent_company || null,
        agent_email: null,
        agent_phone: null,
        lat: app.lat || null,
        lng: app.lng || null,
        source_url: app.link || null,
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
          console.error(`  Insert error for ${planitName}: ${error.message}`);
          totalFailed++;
        }
      } else {
        if (score !== null) {
          console.log(`  [${score}/10 ${relevance}] ${address.slice(0, 60)}`);
        }
        totalNew++;
      }

      await new Promise((r) => setTimeout(r, 300));
    }

    // Polite delay between authorities — 5 seconds to stay within rate limits
    await new Promise((r) => setTimeout(r, 5000));
  }

  console.log(`\n=== Done ===`);
  console.log(`New leads added: ${totalNew}`);
  console.log(`Skipped (already in DB): ${totalSkipped}`);
  console.log(`Errors: ${totalFailed}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
