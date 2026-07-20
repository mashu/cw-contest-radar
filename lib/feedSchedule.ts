import type { LiveContest } from "./types";

const MON: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

export type FeedWindow = { start: Date; end: Date };

function hhmmToParts(s: string): { h: number; m: number } | null {
  const m = s.match(/^(\d{3,4})Z$/i);
  if (!m) return null;
  const raw = m[1].padStart(4, "0");
  return { h: parseInt(raw.slice(0, 2), 10), m: parseInt(raw.slice(2), 10) };
}

function utcAt(year: number, month: number, day: number, h: number, mi: number): Date {
  return new Date(Date.UTC(year, month, day, h, mi, 0));
}

/** Parse a single "1930Z-2030Z, Jul 14" style segment. */
function parseSegment(seg: string, year: number): FeedWindow | null {
  const s = seg.trim();
  // 1930Z-2030Z, Jul 14
  let m = s.match(/^(\d{3,4}Z)\s*-\s*(\d{3,4}Z),\s*([A-Za-z]{3})\s+(\d{1,2})$/i);
  if (m) {
    const a = hhmmToParts(m[1]);
    const b = hhmmToParts(m[2]);
    const mon = MON[m[3].slice(0, 1).toUpperCase() + m[3].slice(1, 3).toLowerCase()];
    const day = parseInt(m[4], 10);
    if (!a || !b || mon == null) return null;
    let start = utcAt(year, mon, day, a.h, a.m);
    let end = utcAt(year, mon, day, b.h, b.m);
    if (end.getTime() <= start.getTime()) end = new Date(end.getTime() + 86400000);
    return { start, end };
  }
  // 0000Z, Nov 28 to 2359Z, Nov 29
  m = s.match(
    /^(\d{3,4}Z),\s*([A-Za-z]{3})\s+(\d{1,2})\s+to\s+(\d{3,4}Z),\s*([A-Za-z]{3})\s+(\d{1,2})$/i
  );
  if (m) {
    const a = hhmmToParts(m[1]);
    const b = hhmmToParts(m[4]);
    const monA = MON[m[2].slice(0, 1).toUpperCase() + m[2].slice(1, 3).toLowerCase()];
    const monB = MON[m[5].slice(0, 1).toUpperCase() + m[5].slice(1, 3).toLowerCase()];
    const dayA = parseInt(m[3], 10);
    const dayB = parseInt(m[6], 10);
    if (!a || !b || monA == null || monB == null) return null;
    let start = utcAt(year, monA, dayA, a.h, a.m);
    let end = utcAt(year, monB, dayB, b.h, b.m);
    // 2359Z means through end of that minute → treat as next hour start if :59
    if (b.m === 59) end = new Date(end.getTime() + 60000);
    if (end.getTime() <= start.getTime()) end = new Date(end.getTime() + 86400000);
    return { start, end };
  }
  // 2300Z, Jul 19 to 0100Z, Jul 20
  m = s.match(
    /^(\d{3,4}Z),\s*([A-Za-z]{3})\s+(\d{1,2})\s+to\s+(\d{3,4}Z),\s*([A-Za-z]{3})\s+(\d{1,2})$/i
  );
  // already covered above
  return null;
}

/**
 * Expand a WA7BNM `time` field into concrete UTC windows.
 * Handles:
 *   "1930Z-2030Z, Jul 14"
 *   "1300Z-1400Z, Jul 22 and 1900Z-2000Z, Jul 22 and …"
 *   "0000Z, Nov 28 to 2359Z, Nov 29"
 *   "0900Z-1200Z and 1300Z-1600Z, Jul 19"
 */
export function parseFeedTime(time: string, year: number): FeedWindow[] {
  const cleaned = time.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  // Split on " and " but keep "to" ranges intact.
  const parts = cleaned.split(/\s+and\s+/i);
  const out: FeedWindow[] = [];

  // Special: "0900Z-1200Z and 1300Z-1600Z, Jul 19" — shared date on last part
  const sharedDate = cleaned.match(/,\s*([A-Za-z]{3})\s+(\d{1,2})\s*$/);
  for (const part of parts) {
    let seg = part.trim();
    // If segment has times but no date, append shared date
    if (sharedDate && !/,\s*[A-Za-z]{3}\s+\d/.test(seg) && /\d{3,4}Z/.test(seg)) {
      seg = `${seg}, ${sharedDate[1]} ${sharedDate[2]}`;
    }
    const w = parseSegment(seg, year);
    if (w) out.push(w);
  }
  return out;
}

export function parseBandsList(bands: string): string[] {
  if (!bands) return [];
  const found = new Set<string>();
  const re = /\b(160|80|60|40|30|20|17|15|12|10|6|2)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(bands))) found.add(m[1]);
  return Array.from(found);
}

/** Map a calendar exchange blurb to a {token} template when possible. */
export function guessExchangeTemplate(exchange: string): string {
  const e = (exchange || "").toLowerCase();
  if (!e) return "{rst} {serial}";
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
  if (/name/.test(e)) return "{name}";
  return "{rst} {serial}";
}

export function shortFromName(name: string): string {
  const paren = name.match(/\(([A-Z0-9][A-Z0-9 \-]{0,10})\)\s*$/i);
  if (paren) return paren[1].toUpperCase().replace(/\s+/g, " ");
  // Take leading capital tokens / acronym
  const words = name.replace(/,/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 10).toUpperCase();
  const acronym = words
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (acronym.length >= 2 && acronym.length <= 8) return acronym;
  return words[0].slice(0, 8).toUpperCase();
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

/** True if a live-feed name likely refers to a curated contest. */
export function namesMatch(feedName: string, curatedName: string, short: string, aliases: string[]): boolean {
  const a = normalizeContestName(feedName);
  const b = normalizeContestName(curatedName);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const feedTokens = new Set(a.split(" "));
  const hay = [short, ...aliases].map((x) => x.toLowerCase());
  for (const h of hay) {
    if (h.length >= 2 && (feedTokens.has(h) || a.includes(h))) return true;
  }
  return false;
}

export function windowsForFeedItem(item: LiveContest, year: number): FeedWindow[] {
  return parseFeedTime(item.time, year);
}
