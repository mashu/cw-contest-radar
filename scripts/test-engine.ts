import { CONTESTS, contestById, matchesHeard, within1 } from "../lib/contests";
import {
  expandContest,
  nthFullWeekendSat,
  nthSat,
  relevantInstance,
  statusOf,
} from "../lib/recurrence";
import { DEFAULT_STATION, renderExchange } from "../lib/station";
import { bandFor, parseFreq } from "../lib/bands";

let fails = 0;
function eq(name: string, got: unknown, want: unknown) {
  const ok = String(got) === String(want);
  if (!ok) fails++;
  console.log(`${ok ? "\u2713" : "\u2717"} ${name} => ${got}${ok ? "" : "  (want " + want + ")"}`);
}
const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 16) + "Z" : "null");
const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "null");

console.log("--- anchor date rules ---");
eq("CQWW CW 2025 anchor", day(nthFullWeekendSat(2025, 10, "last")), "2025-11-29");
eq("WPX CW 2025 anchor", day(nthFullWeekendSat(2025, 4, "last")), "2025-05-24");
eq("ARRL DX 2025 anchor", day(nthFullWeekendSat(2025, 1, 3)), "2025-02-15");
eq("IARU 2025 anchor", day(nthFullWeekendSat(2025, 6, 2)), "2025-07-12");
eq("SP DX 2025 anchor", day(nthFullWeekendSat(2025, 3, 1)), "2025-04-05");
eq("All Asian 2025 anchor", day(nthFullWeekendSat(2025, 5, 3)), "2025-06-21");
eq("WAE CW 2025 anchor", day(nthFullWeekendSat(2025, 7, 2)), "2025-08-09");
eq("CQ160 2026 anchor", day(nthFullWeekendSat(2026, 0, "last")), "2026-01-24");
eq("CW Open 2025 anchor", day(nthSat(2025, 8, 1)), "2025-09-06");

console.log("\n--- expanded instances (start times) ---");
const around = (c: string, from: string, to: string) =>
  expandContest(contestById(c)!, new Date(from), new Date(to));

const cqww = around("cqww", "2025-11-01", "2025-12-05");
eq("CQWW 2025 start", iso(cqww[0]?.start), "2025-11-29T00:00Z");
eq("CQWW 2025 end", iso(cqww[0]?.end), "2025-12-01T00:00Z");

const iaru = around("iaru", "2025-07-01", "2025-07-31");
eq("IARU 2025 start", iso(iaru[0]?.start), "2025-07-12T12:00Z");
eq("IARU 2025 end", iso(iaru[0]?.end), "2025-07-13T12:00Z");

const cq160 = around("cq160", "2026-01-20", "2026-02-05");
eq("CQ160 2026 start (Fri 22Z)", iso(cq160[0]?.start), "2026-01-23T22:00Z");
eq("CQ160 2026 end (Sun 22Z)", iso(cq160[0]?.end), "2026-01-25T22:00Z");

const cwt = around("cwt", "2026-07-20", "2026-07-24");
console.log("  CWT sessions this week:", cwt.map((i) => iso(i.start)).join(", "));
eq("CWT count Mon..Fri", cwt.length, 4);
eq("CWT first is Wed 1300Z", iso(cwt[0]?.start), "2026-07-22T13:00Z");

const mwc = around("mwc", "2026-07-20T00:00:00Z", "2026-07-20T23:59:59Z");
eq("MWC Mon two sessions", mwc.length, 2);
eq("MWC session1 40+80", mwc[0]?.bands.join("+"), "40+80");
eq("MWC session2 80 only", mwc[1]?.bands.join("+"), "80");

const sst = around("sst", "2026-07-20", "2026-07-26");
console.log("  SST sessions:", sst.map((i) => `${day(i.start)} ${iso(i.start).slice(11)}`).join(", "));

const naqp = around("naqp", "2026-01-01", "2026-12-31");
eq("NAQP two sessions/yr (Jan+Aug)", naqp.length, 2);
console.log("  NAQP 2026:", naqp.map((i) => day(i.start)).join(", "));

const cwopen = around("cwopen", "2025-09-01", "2025-09-10");
eq("CW Open 3 sessions", cwopen.length, 3);

console.log("\n--- live status ---");
eq("CWT live Wed 13:30Z", statusOf(cwt[0], new Date("2026-07-22T13:30:00Z")), "live");
eq("CWT soon Wed 12:30Z", statusOf(cwt[0], new Date("2026-07-22T12:30:00Z")), "soon");
eq("CWT later Wed 10:00Z", statusOf(cwt[0], new Date("2026-07-22T10:00:00Z")), "later");
eq("MWC live Mon 17:00Z", statusOf(mwc[0], new Date("2026-07-20T17:00:00Z")), "live");

console.log("\n--- frequency + band ---");
eq("14028 -> 14.028", parseFreq("14028"), 14.028);
eq("7.028 -> 7.028", parseFreq("7.028"), 7.028);
eq("14.028 band", bandFor(parseFreq("14028"))?.label, "20m");
eq("10.125 WARC", bandFor(parseFreq("10125"))?.warc, true);

console.log("\n--- heard-it search ---");
eq("within1 MWC/MWE", within1("MWC", "MWE"), true);
eq("MWE -> MWC", matchesHeard(contestById("mwc")!, "MWE"), true);
eq("YOTA -> yota", matchesHeard(contestById("yota")!, "YOTA"), true);
eq("CWT -> cwt", matchesHeard(contestById("cwt")!, "CWT"), true);
eq("TEST -> cqww generic", matchesHeard(contestById("cqww")!, "TEST"), true);
eq("XYZ -> not cwt", matchesHeard(contestById("cwt")!, "XYZ"), false);

console.log("\n--- exchange rendering (SO5KM) ---");
eq("CQWW", renderExchange(contestById("cqww")!, DEFAULT_STATION), "599 15");
eq("MWC", renderExchange(contestById("mwc")!, DEFAULT_STATION), "599 001");
eq("YOTA", renderExchange(contestById("yota")!, DEFAULT_STATION), "599 34");
eq("IARU", renderExchange(contestById("iaru")!, DEFAULT_STATION), "599 28");
eq("CWT", renderExchange(contestById("cwt")!, DEFAULT_STATION), "MATEUSZ SO");
eq("ARRL DX", renderExchange(contestById("arrldx")!, DEFAULT_STATION), "599 100");
eq("SP DX", renderExchange(contestById("spdx")!, DEFAULT_STATION), "599 R");
eq("Stew Perry grid", renderExchange(contestById("stew")!, DEFAULT_STATION), "KO00");
eq("NAQP name only", renderExchange(contestById("naqp")!, DEFAULT_STATION), "MATEUSZ");

console.log(`\n${fails === 0 ? "ALL PASS" : fails + " FAILED"} (${CONTESTS.length} contests)`);
process.exit(fails === 0 ? 0 : 1);
