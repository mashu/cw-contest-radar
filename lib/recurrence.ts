import type {
  Annual,
  Contest,
  Instance,
  InstanceStatus,
  Manual,
  Recurrence,
  Weekly,
} from "./types";

const DAY = 86400000;

function asArray(r: Recurrence | Recurrence[]): Recurrence[] {
  return Array.isArray(r) ? r : [r];
}

function hhmmToMin(hhmm: string): number {
  const h = parseInt(hhmm.slice(0, 2), 10);
  const m = parseInt(hhmm.slice(2, 4), 10);
  return h * 60 + m;
}

// nth Saturday of a month (UTC). n is 1-indexed or "last".
export function nthSat(year: number, month: number, n: number | "last"): Date | null {
  const sats: Date[] = [];
  const d = new Date(Date.UTC(year, month, 1));
  while (d.getUTCMonth() === month) {
    if (d.getUTCDay() === 6) sats.push(new Date(d));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  if (sats.length === 0) return null;
  if (n === "last") return sats[sats.length - 1];
  return sats[n - 1] ?? null;
}

// nth "full weekend" Saturday: a Saturday whose following Sunday is still in the
// same month. n is 1-indexed or "last".
export function nthFullWeekendSat(
  year: number,
  month: number,
  n: number | "last"
): Date | null {
  const sats: Date[] = [];
  const d = new Date(Date.UTC(year, month, 1));
  while (d.getUTCMonth() === month) {
    if (d.getUTCDay() === 6) {
      const sun = new Date(d.getTime() + DAY);
      if (sun.getUTCMonth() === month) sats.push(new Date(d));
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  if (sats.length === 0) return null;
  if (n === "last") return sats[sats.length - 1];
  return sats[n - 1] ?? null;
}

function expandWeekly(r: Weekly, contest: Contest, from: Date, to: Date): Instance[] {
  const out: Instance[] = [];
  // Start a day early to catch windows that begin the previous UTC day and wrap.
  const cursor = new Date(from.getTime() - DAY);
  cursor.setUTCHours(0, 0, 0, 0);
  const limit = to.getTime() + DAY;
  while (cursor.getTime() <= limit) {
    const dow = cursor.getUTCDay();
    for (const s of r.sessions) {
      if (!s.days.includes(dow)) continue;
      const startMin = hhmmToMin(s.start);
      let endMin = hhmmToMin(s.end);
      if (endMin <= startMin) endMin += 24 * 60; // wrap past midnight
      const start = new Date(cursor.getTime() + startMin * 60000);
      const end = new Date(cursor.getTime() + endMin * 60000);
      if (end >= from && start <= to) {
        out.push({
          contestId: contest.id,
          start,
          end,
          bands: s.bands ?? contest.bands,
        });
      }
    }
    cursor.setTime(cursor.getTime() + DAY);
  }
  return out;
}

function expandAnnual(r: Annual, contest: Contest, from: Date, to: Date): Instance[] {
  const out: Instance[] = [];
  for (let year = from.getUTCFullYear() - 1; year <= to.getUTCFullYear() + 1; year++) {
    const anchor =
      r.rule === "fullWeekend"
        ? nthFullWeekendSat(year, r.month, r.n)
        : nthSat(year, r.month, r.n);
    if (!anchor) continue;
    const base = Date.UTC(
      anchor.getUTCFullYear(),
      anchor.getUTCMonth(),
      anchor.getUTCDate()
    );
    for (const s of r.sessions) {
      const start = new Date(
        base + s.startH * 3600000 + (s.startM ?? 0) * 60000
      );
      const end = new Date(
        start.getTime() + s.durationH * 3600000 + (s.durationM ?? 0) * 60000
      );
      if (end >= from && start <= to) {
        out.push({
          contestId: contest.id,
          start,
          end,
          bands: s.bands ?? contest.bands,
        });
      }
    }
  }
  return out;
}

function expandManual(r: Manual, contest: Contest, from: Date, to: Date): Instance[] {
  const out: Instance[] = [];
  for (const w of r.windows) {
    const start = new Date(w.start);
    const end = new Date(w.end);
    if (end >= from && start <= to) {
      out.push({ contestId: contest.id, start, end, bands: w.bands ?? contest.bands });
    }
  }
  return out;
}

export function expandContest(contest: Contest, from: Date, to: Date): Instance[] {
  const out: Instance[] = [];
  for (const r of asArray(contest.recurrence)) {
    if (r.kind === "weekly") out.push(...expandWeekly(r, contest, from, to));
    else if (r.kind === "annual") out.push(...expandAnnual(r, contest, from, to));
    else out.push(...expandManual(r, contest, from, to));
  }
  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  return out;
}

export function expandAll(contests: Contest[], from: Date, to: Date): Instance[] {
  const all: Instance[] = [];
  for (const c of contests) all.push(...expandContest(c, from, to));
  all.sort((a, b) => a.start.getTime() - b.start.getTime());
  return all;
}

const SOON_MS = 90 * 60000; // "soon" = within 90 minutes of the selected time

export function statusOf(inst: Instance, at: Date): InstanceStatus {
  const t = at.getTime();
  if (t >= inst.start.getTime() && t < inst.end.getTime()) return "live";
  if (t < inst.start.getTime()) {
    return inst.start.getTime() - t <= SOON_MS ? "soon" : "later";
  }
  return "past";
}

// The most relevant instance of a contest relative to a moment: a live one wins,
// otherwise the nearest upcoming, otherwise the most recent past.
export function relevantInstance(insts: Instance[], at: Date): Instance | null {
  if (insts.length === 0) return null;
  const t = at.getTime();
  const live = insts.find((i) => t >= i.start.getTime() && t < i.end.getTime());
  if (live) return live;
  const upcoming = insts
    .filter((i) => i.start.getTime() >= t)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  if (upcoming.length) return upcoming[0];
  const past = insts
    .filter((i) => i.end.getTime() < t)
    .sort((a, b) => b.end.getTime() - a.end.getTime());
  return past[0] ?? null;
}
