import { parseFeedTime, guessExchangeTemplate, namesMatch } from "../lib/feedSchedule";

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

console.log(fails === 0 ? "\nALL PASS (feed schedule)" : `\n${fails} FAILED`);
process.exit(fails === 0 ? 0 : 1);
