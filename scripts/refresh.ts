// Pulls the WA7BNM weekly calendar, filters to CW, and writes it as static JSON.
// Runs in CI (which has network); the app reads the committed file same-origin.
//
//   npm run refresh                 # fetch live
//   SAMPLE_FILE=scripts/sample-weeklycal.txt npm run refresh   # offline/dev
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { parseWeeklyCal, cwOnly } from "../lib/feed";
import type { LiveFeed } from "../lib/types";

const SOURCE_URL = "https://www.contestcalendar.com/weeklycal.txt";
const OUT = "public/data/contests.json";

async function getText(): Promise<{ text: string; source: string }> {
  const sample = process.env.SAMPLE_FILE;
  if (sample) {
    return { text: readFileSync(sample, "utf8"), source: `sample:${sample}` };
  }
  const res = await fetch(SOURCE_URL, {
    headers: { "User-Agent": "cw-contest-radar/1.0 (+github pages)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${SOURCE_URL}`);
  return { text: await res.text(), source: SOURCE_URL };
}

async function main() {
  try {
    const { text, source } = await getText();
    const items = cwOnly(parseWeeklyCal(text));
    const feed: LiveFeed = {
      generatedAt: new Date().toISOString(),
      source,
      items,
    };
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(feed, null, 2) + "\n");
    console.log(`Wrote ${OUT} — ${items.length} CW events from ${source}`);
  } catch (err) {
    console.error("refresh failed:", (err as Error).message);
    if (existsSync(OUT)) {
      console.log("Keeping the existing committed feed.");
      process.exit(0);
    }
    // No existing data: write an empty-but-valid feed so the app still loads.
    const empty: LiveFeed = {
      generatedAt: new Date().toISOString(),
      source: "unavailable",
      items: [],
    };
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(empty, null, 2) + "\n");
    process.exit(0);
  }
}

main();
