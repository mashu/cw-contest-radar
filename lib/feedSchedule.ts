import type { LiveContest } from "./types";

const MON: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

export type FeedWindow = { start: Date; end: Date };

function hhmmToParts(s: string): { h: number; m: number } | null {
  const m = s.match(/^(\d{3,4})Z$/i);
  if (!m?.[1]) return null;
  const raw = m[1].padStart(4, "0");
  return { h: parseInt(raw.slice(0, 2), 10), m: parseInt(raw.slice(2), 10) };
}

function monthNum(mon: string): number | undefined {
  const key = mon.slice(0, 1).toUpperCase() + mon.slice(1, 3).toLowerCase();
  return MON[key];
}

function utcAt(year: number, month: number, day: number, h: number, mi: number): Date {
  return new Date(Date.UTC(year, month, day, h, mi, 0));
}

/** Parse a single dated time segment into a UTC window. */
function parseSegment(seg: string, year: number): FeedWindow | null {
  const s = seg.trim();

  // 1930Z-2030Z, Jul 14
  let m = s.match(/^(\d{3,4}Z)\s*-\s*(\d{3,4}Z),\s*([A-Za-z]{3})\s+(\d{1,2})$/i);
  if (m?.[1] && m[2] && m[3] && m[4]) {
    const a = hhmmToParts(m[1]);
    const b = hhmmToParts(m[2]);
    const mon = monthNum(m[3]);
    const day = parseInt(m[4], 10);
    if (!a || !b || mon == null) return null;
    let start = utcAt(year, mon, day, a.h, a.m);
    let end = utcAt(year, mon, day, b.h, b.m);
    if (end.getTime() <= start.getTime()) end = new Date(end.getTime() + 86400000);
    return { start, end };
  }

  // 0000Z, Nov 28 to 2359Z, Nov 29   OR   2300Z, Jul 19 to 0100Z, Jul 20
  m = s.match(
    /^(\d{3,4}Z),\s*([A-Za-z]{3})\s+(\d{1,2})\s+to\s+(\d{3,4}Z),\s*([A-Za-z]{3})\s+(\d{1,2})$/i
  );
  if (m?.[1] && m[2] && m[3] && m[4] && m[5] && m[6]) {
    const a = hhmmToParts(m[1]);
    const b = hhmmToParts(m[4]);
    const monA = monthNum(m[2]);
    const monB = monthNum(m[5]);
    const dayA = parseInt(m[3], 10);
    const dayB = parseInt(m[6], 10);
    if (!a || !b || monA == null || monB == null) return null;
    let start = utcAt(year, monA, dayA, a.h, a.m);
    let end = utcAt(year, monB, dayB, b.h, b.m);
    if (b.m === 59) end = new Date(end.getTime() + 60000);
    if (end.getTime() <= start.getTime()) end = new Date(end.getTime() + 86400000);
    return { start, end };
  }

  // Bare date fallback: "Jul 14" → that UTC day (00:00–24:00)
  m = s.match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  if (m?.[1] && m[2]) {
    const mon = monthNum(m[1]);
    const day = parseInt(m[2], 10);
    if (mon == null) return null;
    const start = utcAt(year, mon, day, 0, 0);
    const end = new Date(start.getTime() + 86400000);
    return { start, end };
  }

  return null;
}

/**
 * Expand a WA7BNM `time` field into concrete UTC windows.
 * Never throws; returns [] only when nothing date-like is present.
 */
export function parseFeedTime(time: string, year: number): FeedWindow[] {
  const cleaned = time.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  // Protect "to" ranges from being split on "and"
  const parts = cleaned.split(/\s+and\s+/i);
  const out: FeedWindow[] = [];
  const sharedDate = cleaned.match(/,\s*([A-Za-z]{3})\s+(\d{1,2})\s*$/);

  for (const part of parts) {
    let seg = part.trim();
    if (sharedDate?.[1] && sharedDate[2] && !/,\s*[A-Za-z]{3}\s+\d/.test(seg) && /\d{3,4}Z/.test(seg)) {
      seg = `${seg}, ${sharedDate[1]} ${sharedDate[2]}`;
    }
    // "0900Z-1200Z and 1300Z-1600Z, Jul 19" — range without comma date yet
    if (!/,\s*[A-Za-z]{3}\s+\d/.test(seg) && /^(\d{3,4}Z)\s*-\s*(\d{3,4}Z)$/i.test(seg) && sharedDate?.[1] && sharedDate[2]) {
      seg = `${seg}, ${sharedDate[1]} ${sharedDate[2]}`;
    }
    const w = parseSegment(seg, year);
    if (w) out.push(w);
  }

  // Last-resort: pull any "Mon DD" mentions and make all-day windows
  if (out.length === 0) {
    const re = /\b([A-Za-z]{3})\s+(\d{1,2})\b/g;
    let mm: RegExpExecArray | null;
    const seen = new Set<string>();
    while ((mm = re.exec(cleaned))) {
      const key = `${mm[1]}-${mm[2]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const w = parseSegment(`${mm[1]} ${mm[2]}`, year);
      if (w) out.push(w);
    }
  }

  return out;
}

export function parseBandsList(bands: string): string[] {
  if (!bands) return [];
  const found = new Set<string>();
  const re = /\b(160|80|60|40|30|20|17|15|12|10|6|2)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(bands))) {
    if (m[1]) found.add(m[1]);
  }
  return Array.from(found);
}

/** Map a calendar exchange blurb to a {token} template when possible. */
export function guessExchangeTemplate(exchange: string): string {
  const e = (exchange || "").toLowerCase();
  if (!e.trim()) return "see rules";
  if (/serial/.test(e) && /rst/.test(e)) return "{rst} {serial}";
  if (/serial/.test(e) && /name/.test(e) && /qth|state|province/.test(e))
    return "{serial} {name} {spc}";
  if (/name/.test(e) && /member|number|no\.?/.test(e) && !/rst/.test(e))
    return "{name} {prefix}";
  if (/rst/.test(e) && /name/.test(e)) return "{rst} {name}";
  if (/name/.test(e) && /state|province|country/.test(e) && !/rst/.test(e))
    return "{name} {country}";
  if (/rst/.test(e) && /age/.test(e)) return "{rst} {age}";
  if (/rst/.test(e) && /power/.test(e)) return "{rst} {power}";
  if (/grid/.test(e)) return "{grid}";
  if (/serial/.test(e)) return "{rst} {serial}";
  if (/name/.test(e) && !/maximum|wpm/.test(e)) return "{name}";
  // Keep the raw calendar text as a non-token hint when we can't map it
  return "see rules";
}

export function shortFromName(name: string): string {
  const paren = name.match(/\(([A-Z0-9][A-Z0-9 \-]{0,10})\)\s*$/i);
  if (paren?.[1]) return paren[1].toUpperCase().replace(/\s+/g, " ");
  const words = name.replace(/,/g, " ").split(/\s+/).filter(Boolean);
  const first = words[0];
  if (!first) return "CW";
  if (words.length === 1) return first.slice(0, 10).toUpperCase();
  const acronym = words
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (acronym.length >= 2 && acronym.length <= 8) return acronym;
  return first.slice(0, 8).toUpperCase();
}

export function slugId(name: string): string {
  return (
    "cal-" +
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48)
  );
}

export function normalizeContestName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const GENERIC_TOKENS = new Set([
  "contest",
  "test",
  "radio",
  "championship",
  "sprint",
  "memorial",
  "group",
  "challenge",
  "party",
  "hunt",
  "weekend",
  "open",
  "classic",
  "weekly",
  "activity",
  "team",
  "international",
  "region",
  "world",
  "low",
  "high",
  "power",
  "speed",
  "slow",
  "medium",
  "mini",
  "bands",
  "band",
  "meter",
  "meters",
  "qrp",
  "qso",
]);

/**
 * Strict match: feed name ↔ curated contest.
 * Short aliases (CWT, NS, …) only count when they appear in parentheses in the
 * feed title. Shared-token matching ignores generic words like "contest"/"test".
 */
export function namesMatch(
  feedName: string,
  curatedName: string,
  short: string,
  aliases: string[]
): boolean {
  const a = normalizeContestName(feedName);
  const b = normalizeContestName(curatedName);
  if (!a || !b) return false;
  if (a === b) return true;

  // Containment only when the shorter side is substantial
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  if (shorter.length >= 14 && longer.includes(shorter)) return true;

  // Parenthetical short from the feed, e.g. "(CWT)" / "(MWC)"
  const feedParen = feedName.match(/\(([A-Za-z0-9][A-Za-z0-9 \-]{0,12})\)\s*$/);
  if (feedParen?.[1]) {
    const p = feedParen[1].toUpperCase().replace(/\s+/g, " ");
    if (p === short.toUpperCase()) return true;
    if (aliases.some((al) => al.toUpperCase() === p)) return true;
  }

  // Shared distinctive tokens only
  const meaningful = (t: string) => t.length >= 4 && !GENERIC_TOKENS.has(t);
  const aTok = a.split(" ").filter(meaningful);
  const bTok = new Set(b.split(" ").filter(meaningful));
  const shared = aTok.filter((t) => bTok.has(t));
  if (shared.length >= 2) return true;
  if (shared.some((t) => t.length >= 8)) return true;

  return false;
}

export function windowsForFeedItem(item: LiveContest, year: number): FeedWindow[] {
  return parseFeedTime(item.time, year);
}

/** Fallback when no time could be parsed — mark as "listed this week". */
export function fallbackWindow(feedGeneratedAt: string): FeedWindow {
  const t = new Date(feedGeneratedAt);
  const start = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()));
  return { start, end: new Date(start.getTime() + 7 * 86400000) };
}
