import { readFileSync } from "node:fs";
import { mergeCalendarFeed } from "../lib/calendarMerge";
import {
  guessExchangeTemplate,
  namesMatch,
  parseFeedTime,
} from "../lib/feedSchedule";
import type { LiveFeed } from "../lib/types";

let fails = 0;
function eq(name: string, got: unknown, want: unknown) {
  const ok = String(got) === String(want);
  if (!ok) fails++;
  console.log(`${ok ? "\u2713" : "\u2717"} ${name} => ${got}${ok ? "" : "  (want " + want + ")"}`);
}

console.log("--- feed time parsing ---");
const ttc = parseFeedTime("1930Z-2030Z, Jul 21", 2026);
eq("TTC windows", ttc.length, 1);
eq("TTC start", ttc[0]?.start.toISOString(), "2026-07-21T19:30:00.000Z");
eq("TTC end", ttc[0]?.end.toISOString(), "2026-07-21T20:30:00.000Z");

const multi = parseFeedTime(
  "1300Z-1400Z, Jul 22 and 1900Z-2000Z, Jul 22 and 0300Z-0400Z, Jul 23",
  2026
);
eq("CWT multi windows", multi.length, 3);

const weekend = parseFeedTime("0000Z, Nov 28 to 2359Z, Nov 29", 2025);
eq("CQWW-style start", weekend[0]?.start.toISOString(), "2025-11-28T00:00:00.000Z");

eq("guess RST+serial", guessExchangeTemplate("RST + Serial No."), "{rst} {serial}");
eq("guess name+prefix", guessExchangeTemplate("Name + Member No."), "{name} {prefix}");
eq(
  "match TTC",
  namesMatch("Tuesday's Telegraphy Contest", "Tuesday's Telegraphy Contest", "TTC", ["TTC"]),
  true
);
eq(
  "no false NS match",
  namesMatch("Russian Radio Team Championship", "NCCC Sprint", "NS", ["NS", "NCCC"]),
  false
);
eq(
  "no false IARU 70 match",
  namesMatch("IARU Region 1 70 MHz Contest", "IARU HF World Championship", "IARU", ["IARU"]),
  false
);
eq(
  "CWT paren match",
  namesMatch("CWops Test (CWT)", "CWops Mini-CWT Test", "CWT", ["CWT", "CWO"]),
  true
);

console.log("\n--- full calendar coverage ---");
const feed = JSON.parse(readFileSync("public/data/contests.json", "utf8")) as LiveFeed;
const merged = mergeCalendarFeed(feed);
eq("feed items preserved", merged.feedItems, feed.items.length);
eq("every feed row becomes instances", merged.instances.length >= feed.items.length, true);
eq("unmatched become cal-* contests", merged.calendarOnly > 0, true);

const synthIds = new Set(merged.contests.filter((c) => c.id.startsWith("cal-")).map((c) => c.id));
eq("Russian Radio is calendar-only", [...synthIds].some((id) => id.includes("russian")), true);
eq("IARU 70 is calendar-only", [...synthIds].some((id) => id.includes("70") || id.includes("iaru-region")), true);

console.log(fails === 0 ? "\nALL PASS (feed schedule)" : `\n${fails} FAILED`);
process.exit(fails === 0 ? 0 : 1);
