import type { Contest } from "./types";

// Hand-curated CW contests. Recurrence rules compute every occurrence client-side
// so the app needs no server. Verify exact exchanges on each linked rules page
// before a serious effort — organizers occasionally tweak them.
export const CONTESTS: Contest[] = [
  {
    id: "cwt",
    name: "CWops Mini-CWT Test",
    short: "CWT",
    cq: "CQ CWT",
    aliases: ["CWT", "CQ CWT", "CWO"],
    bands: ["80", "40", "20", "15", "10"],
    exchange: {
      youSend: "{name} {prefix}",
      note: "No RST. CWops members send name + member number; you send name + your prefix/country. It runs fast, but ops will slow to your speed if you call slower.",
      rst: false,
    },
    logs: { url: "https://www.3830scores.com/" },
    rules: "https://cwops.org/cwops-tests/",
    tip: "Roughly 28 kHz up from each band edge. Send once, log quickly, keep moving.",
    tier: "sprint",
    recurrence: {
      kind: "weekly",
      sessions: [
        { days: [3], start: "1300", end: "1400" },
        { days: [3], start: "1900", end: "2000" },
        { days: [4], start: "0300", end: "0400" },
        { days: [4], start: "0700", end: "0800" },
      ],
    },
  },
  {
    id: "sst",
    name: "K1USN Slow Speed Test",
    short: "SST",
    cq: "CQ SST",
    aliases: ["SST", "CQ SST"],
    bands: ["160", "80", "40", "20", "15", "10"],
    exchange: {
      youSend: "{name} {country}",
      note: "Slow speed (keep it 20 wpm or under). Send name + your state/province/country. As DX you send name + country.",
      rst: false,
    },
    logs: { url: "https://www.3830scores.com/" },
    rules: "http://www.k1usn.com/sst.html",
    tip: "The friendliest place to build speed and confidence. Match their pace.",
    tier: "sprint",
    recurrence: {
      kind: "weekly",
      sessions: [
        { days: [5], start: "2000", end: "2100" },
        { days: [1], start: "0000", end: "0100" },
      ],
    },
  },
  {
    id: "mst",
    name: "ICWC Medium Speed Test",
    short: "MST",
    cq: "CQ MST",
    aliases: ["MST", "CQ MST"],
    bands: ["80", "40", "20"],
    exchange: {
      youSend: "{name} {serial}",
      note: "Send name + serial number, starting at 001 and counting up across the session.",
      rst: false,
    },
    logs: { url: "https://www.3830scores.com/" },
    rules: "https://icwc.uk/mst.html",
    tip: "Medium speed, roughly 20–25 wpm. A good step up from the slow-speed tests.",
    tier: "sprint",
    recurrence: {
      kind: "weekly",
      sessions: [
        { days: [1], start: "1300", end: "1400" },
        { days: [1], start: "1900", end: "2000" },
        { days: [2], start: "0300", end: "0400" },
      ],
    },
  },
  {
    id: "mwc",
    name: "OK1WC Memorial (MWC)",
    short: "MWC",
    cq: "CQ MWC",
    aliases: ["MWC", "MWE", "OK1WC", "CQ MWC"],
    bands: ["40", "80"],
    exchange: {
      youSend: "{rst} {serial}",
      note: "Send RST + serial. The multiplier is the last letter of each worked station's suffix.",
      rst: true,
    },
    logs: { url: "https://memorial-ok1wc.cz/" },
    rules: "https://memorial-ok1wc.cz/index.php?page=rules2l",
    tip: "Every Monday. Two short runs — the second one is 80m only.",
    tier: "sprint",
    recurrence: {
      kind: "weekly",
      sessions: [
        { days: [1], start: "1630", end: "1729", bands: ["40", "80"] },
        { days: [1], start: "1900", end: "2030", bands: ["80"] },
      ],
    },
  },
  {
    id: "yota",
    name: "YOTA Contest",
    short: "YOTA",
    cq: "CQ YOTA",
    aliases: ["YOTA", "CQ YOTA"],
    bands: ["80", "40", "20", "15", "10"],
    exchange: {
      youSend: "{rst} {age}",
      note: "Send RST + your age. Youngsters (under 25) are the multipliers, so work as many as you can.",
      rst: true,
    },
    logs: { url: "https://yotacontest.mrasz.org/", deadline: "within 7 days" },
    rules: "https://www.ham-yota.com/contest/",
    tip: "Dates are announced yearly (typically spring, summer, and December).",
    tier: "major",
    recurrence: {
      kind: "manual",
      windows: [
        { start: "2026-07-19T10:00:00Z", end: "2026-07-19T22:00:00Z" },
        { start: "2026-12-30T10:00:00Z", end: "2026-12-30T22:00:00Z" },
      ],
    },
  },
  {
    id: "cqww",
    name: "CQ World-Wide DX Contest, CW",
    short: "CQWW",
    cq: "CQ TEST",
    aliases: ["CQWW", "CQ WW", "CQWWCW", "WW"],
    bands: ["160", "80", "40", "20", "15", "10"],
    exchange: {
      youSend: "{rst} {cq}",
      note: "Send RST + your CQ zone (no serials). Most of Europe is zones 14, 15, 16 and 20.",
      rst: true,
    },
    logs: { url: "https://www.cqww.com/logcheck/", deadline: "5 days after the contest" },
    rules: "https://www.cqww.com/rules.htm",
    tip: "The big one — 48 hours, last full weekend of November. Zones are the multiplier.",
    tier: "major",
    recurrence: {
      kind: "annual",
      month: 10,
      rule: "fullWeekend",
      n: "last",
      sessions: [{ startH: 0, durationH: 48 }],
    },
  },
  {
    id: "wpx",
    name: "CQ WPX Contest, CW",
    short: "WPX",
    cq: "CQ TEST",
    aliases: ["WPX", "CQ WPX", "WPXCW"],
    bands: ["160", "80", "40", "20", "15", "10"],
    exchange: {
      youSend: "{rst} {serial}",
      note: "Send RST + serial (from 001). Every unique prefix worked is a multiplier.",
      rst: true,
    },
    logs: { url: "https://cqwpx.com/logcheck/", deadline: "5 days after the contest" },
    rules: "https://cqwpx.com/rules.htm",
    tip: "Last full weekend of May. Prefixes are the mults, so serials climb fast.",
    tier: "major",
    recurrence: {
      kind: "annual",
      month: 4,
      rule: "fullWeekend",
      n: "last",
      sessions: [{ startH: 0, durationH: 48 }],
    },
  },
  {
    id: "arrldx",
    name: "ARRL International DX Contest, CW",
    short: "ARRL DX",
    cq: "CQ TEST",
    aliases: ["ARRLDX", "ARRL DX", "CQ DX"],
    bands: ["160", "80", "40", "20", "15", "10"],
    exchange: {
      youSend: "{rst} {power}",
      note: "As DX you send RST + your power in watts. W/VE stations send RST + their state or province.",
      rst: true,
    },
    logs: { url: "http://contest-log-submission.arrl.org/", deadline: "within 7 days" },
    rules: "http://www.arrl.org/arrl-dx",
    tip: "3rd full weekend of February. You work only W/VE — they need your power figure.",
    tier: "major",
    recurrence: {
      kind: "annual",
      month: 1,
      rule: "fullWeekend",
      n: 3,
      sessions: [{ startH: 0, durationH: 48 }],
    },
  },
  {
    id: "iaru",
    name: "IARU HF World Championship",
    short: "IARU",
    cq: "CQ TEST",
    aliases: ["IARU", "CQ IARU"],
    bands: ["160", "80", "40", "20", "15", "10"],
    exchange: {
      youSend: "{rst} {itu}",
      note: "Send RST + your ITU zone (not CQ zone). HQ and official stations send a society abbreviation instead.",
      rst: true,
    },
    logs: { url: "https://contests.arrl.org/", deadline: "within 7 days" },
    rules: "http://www.arrl.org/iaru-hf-world-championship",
    tip: "2nd full weekend of July, 24 hours. HQ stations are juicy multipliers.",
    tier: "major",
    recurrence: {
      kind: "annual",
      month: 6,
      rule: "fullWeekend",
      n: 2,
      sessions: [{ startH: 12, durationH: 24 }],
    },
  },
  {
    id: "aacw",
    name: "All Asian DX Contest, CW",
    short: "All Asian",
    cq: "CQ AS",
    aliases: ["AA", "ALL ASIAN", "AACW", "CQ AS"],
    bands: ["160", "80", "40", "20", "15", "10"],
    exchange: {
      youSend: "{rst} {age}",
      note: "Send RST + your age as two digits. You work Asian stations only.",
      rst: true,
    },
    logs: { url: "https://www.jarl.org/English/", deadline: "within about a month" },
    rules: "https://www.jarl.org/English/4_Library/A-4-3_Contests/2023AA_e.htm",
    tip: "3rd full weekend of June. Age is the exchange — and it drives the mults.",
    tier: "major",
    recurrence: {
      kind: "annual",
      month: 5,
      rule: "fullWeekend",
      n: 3,
      sessions: [{ startH: 0, durationH: 48 }],
    },
  },
  {
    id: "spdx",
    name: "SP DX Contest",
    short: "SP DX",
    cq: "CQ SP",
    aliases: ["SPDX", "SP DX", "CQ SP"],
    bands: ["160", "80", "40", "20", "15", "10"],
    exchange: {
      youSend: "{rst} {province}",
      note: "As an SP station you send RST + your province letter. DX stations send RST + serial and chase Poland.",
      rst: true,
    },
    logs: { url: "https://logs.pzk.org.pl/", deadline: "within 7 days" },
    rules: "https://spdxcontest.pzk.org.pl/",
    tip: "First full weekend of April. Home turf — you're the DX everyone wants.",
    tier: "regional",
    recurrence: {
      kind: "annual",
      month: 3,
      rule: "fullWeekend",
      n: 1,
      sessions: [{ startH: 15, durationH: 24 }],
    },
  },
  {
    id: "waecw",
    name: "WAE DX Contest, CW",
    short: "WAE CW",
    cq: "CQ TEST",
    aliases: ["WAE", "WAEDC", "CQ WAE"],
    bands: ["80", "40", "20", "15", "10"],
    exchange: {
      youSend: "{rst} {serial}",
      note: "Send RST + serial. As a European you work DX only, and QTCs (logged traffic) with them are bonus points.",
      rst: true,
    },
    logs: { url: "https://dxhf2.darc.de/~waelog/upload/", deadline: "within 7 days" },
    rules: "https://www.darc.de/der-club/referate/conteste/wae-dx-contest/en/",
    tip: "2nd full weekend of August. Learn the QTC procedure — it doubles your points.",
    tier: "major",
    recurrence: {
      kind: "annual",
      month: 7,
      rule: "fullWeekend",
      n: 2,
      sessions: [{ startH: 0, durationH: 48 }],
    },
  },
  {
    id: "cwopen",
    name: "CW Open",
    short: "CW Open",
    cq: "CQ CWO",
    aliases: ["CW OPEN", "CWOPEN", "CQ CWO"],
    bands: ["160", "80", "40", "20", "15", "10"],
    exchange: {
      youSend: "{serial} {name}",
      note: "Send serial + name. Three separate 4-hour sessions, each scored on its own.",
      rst: false,
    },
    logs: { url: "https://3830scores.com/", deadline: "within 24 hours" },
    rules: "https://cwops.org/cw-open/",
    tip: "First Saturday of September. Enter whichever of the three sessions fit your day.",
    tier: "sprint",
    recurrence: {
      kind: "annual",
      month: 8,
      rule: "saturday",
      n: 1,
      sessions: [
        { startH: 0, durationH: 4 },
        { startH: 12, durationH: 4 },
        { startH: 20, durationH: 4 },
      ],
    },
  },
  {
    id: "cq160",
    name: "CQ 160-Meter Contest, CW",
    short: "CQ 160",
    cq: "CQ TEST",
    aliases: ["CQ160", "CQ 160", "160 CW"],
    bands: ["160"],
    exchange: {
      youSend: "{rst} {cq}",
      note: "As DX you send RST + CQ zone. W/VE stations send RST + state or province.",
      rst: true,
    },
    logs: { url: "https://www.cq160.com/logs.htm", deadline: "within 5 days" },
    rules: "https://www.cq160.com/rules.htm",
    tip: "Last full weekend of January. Topband only — antenna and timing are everything.",
    tier: "major",
    recurrence: {
      kind: "annual",
      month: 0,
      rule: "fullWeekend",
      n: "last",
      sessions: [{ startH: -2, durationH: 48 }],
    },
  },
  {
    id: "stew",
    name: "Stew Perry Topband Distance Challenge",
    short: "Stew Perry",
    cq: "CQ STEW",
    aliases: ["STEW", "STEW PERRY", "TBDC"],
    bands: ["160"],
    exchange: {
      youSend: "{grid}",
      note: "Send only your 4-character grid square. Scoring is by distance between the two grids.",
      rst: false,
    },
    logs: { url: "http://www.kkn.net/stew/", deadline: "within about a week" },
    rules: "http://www.kkn.net/stew/",
    tip: "Distance is everything — a far, rare grid is worth far more than a local one.",
    tier: "regional",
    recurrence: {
      kind: "annual",
      month: 11,
      rule: "fullWeekend",
      n: "last",
      sessions: [{ startH: 15, durationH: 24 }],
    },
  },
  {
    id: "naqp",
    name: "North American QSO Party, CW",
    short: "NAQP",
    cq: "CQ NA",
    aliases: ["NAQP", "CQ NA"],
    bands: ["160", "80", "40", "20", "15", "10"],
    exchange: {
      youSend: "{name}",
      note: "W/VE send name + state/province. As DX outside North America you send just your name.",
      rst: false,
    },
    logs: { url: "https://www.ncjweb.com/naqplogs/", deadline: "within 5 days" },
    rules: "https://www.ncjweb.com/naqp-rules/",
    tip: "100 W maximum, low-key and fun. As DX you simply hand out your name.",
    tier: "regional",
    recurrence: [
      {
        kind: "annual",
        month: 0,
        rule: "saturday",
        n: 2,
        sessions: [{ startH: 18, durationH: 12 }],
      },
      {
        kind: "annual",
        month: 7,
        rule: "saturday",
        n: 1,
        sessions: [{ startH: 18, durationH: 12 }],
      },
    ],
  },
  {
    id: "arrl160",
    name: "ARRL 160-Meter Contest",
    short: "ARRL 160",
    cq: "CQ TEST",
    aliases: ["ARRL160", "ARRL 160"],
    bands: ["160"],
    exchange: {
      youSend: "{rst}",
      note: "As DX you send RST only. W/VE stations add their ARRL/RAC section.",
      rst: true,
    },
    logs: { url: "http://contest-log-submission.arrl.org/", deadline: "within 7 days" },
    rules: "http://www.arrl.org/160-meter",
    tip: "First full weekend of December, CW only. Work the W/VE pileups on topband.",
    tier: "regional",
    recurrence: {
      kind: "annual",
      month: 11,
      rule: "fullWeekend",
      n: 1,
      sessions: [{ startH: -2, durationH: 42 }],
    },
  },
];

export function contestById(id: string): Contest | undefined {
  return CONTESTS.find((c) => c.id === id);
}

// Fuzzy match for "what did I copy off the air". Handles a single wrong/edge
// character so a mis-copied "MWE" still resolves to MWC.
export function within1(a: string, b: string): boolean {
  a = a.toUpperCase();
  b = b.toUpperCase();
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0,
    j = 0,
    edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
    } else {
      edits++;
      if (edits > 1) return false;
      if (a.length > b.length) i++;
      else if (a.length < b.length) j++;
      else {
        i++;
        j++;
      }
    }
  }
  edits += a.length - i + (b.length - j);
  return edits <= 1;
}

export function matchesHeard(contest: Contest, heard: string): boolean {
  const q = heard.trim().toUpperCase();
  if (!q) return false;
  const hay = [contest.short, contest.cq, contest.name, ...contest.aliases];
  const tokens = q.split(/\s+/);
  for (const h of hay) {
    const H = h.toUpperCase();
    if (H.includes(q) || q.includes(H)) return true;
    for (const t of tokens) {
      if (t.length < 2) continue;
      for (const word of H.split(/\s+/)) {
        if (within1(t, word)) return true;
      }
    }
  }
  // Generic on-air calls that don't name a specific contest.
  if ((q === "TEST" || q === "CQ TEST") && contest.cq === "CQ TEST") return true;
  return false;
}
