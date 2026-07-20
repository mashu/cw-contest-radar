import type { LiveContest, LiveFeed } from "./types";

// Field labels used in WA7BNM's plain-text weekly calendar (weeklycal.txt).
const FIELD_LABELS = [
  "Geographic Focus",
  "Participation",
  "Mode",
  "Bands",
  "Classes",
  "Max operating hours",
  "Max power",
  "Exchange",
  "Work stations",
  "QSO Points",
  "Multipliers",
  "Score Calculation",
  "E-mail logs to",
  "Email logs to",
  "Upload log at",
  "Post log summary at",
  "Mail logs to",
  "Find rules at",
  "Submit logs by",
  "Objective",
];

function isFieldLine(line: string): { label: string; value: string } | null {
  const ci = line.indexOf(":");
  if (ci < 0) return null;
  const label = line.slice(0, ci).trim();
  if (FIELD_LABELS.includes(label)) {
    return { label, value: line.slice(ci + 1).trim() };
  }
  return null;
}

// A header line names a contest and carries a time window, e.g.
//   "OK1WC Memorial (MWC): 1630Z-1729Z, Jul 20"
//   "CQ World Wide DX Contest, CW: 0000Z, Nov 28 to 2359Z, Nov 29"
function isHeaderLine(line: string): { name: string; time: string } | null {
  const ci = line.indexOf(":");
  if (ci < 0) return null;
  const label = line.slice(0, ci).trim();
  if (FIELD_LABELS.includes(label)) return null;
  const value = line.slice(ci + 1).trim();
  if (/\d{3,4}Z/.test(value)) return { name: label, time: value };
  return null;
}

export function parseWeeklyCal(text: string): LiveContest[] {
  const lines = text.split(/\r?\n/);
  const items: LiveContest[] = [];
  let cur: (LiveContest & { f: Record<string, string> }) | null = null;

  const flush = () => {
    if (!cur) return;
    const f = cur.f;
    cur.mode = f["Mode"] || cur.mode || "";
    cur.bands = f["Bands"] || cur.bands || "";
    cur.exchange = f["Exchange"] || cur.exchange || "";
    cur.rules = f["Find rules at"] || cur.rules;
    cur.log =
      f["Upload log at"] ||
      f["Post log summary at"] ||
      f["E-mail logs to"] ||
      f["Email logs to"] ||
      cur.log;
    cur.deadline = f["Submit logs by"] || cur.deadline;
    cur.cw = /\bcw\b/i.test(cur.mode);
    const { f: _f, ...rest } = cur;
    items.push(rest);
    cur = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const field = isFieldLine(line);
    if (field && cur) {
      cur.f[field.label] = field.value;
      continue;
    }
    const header = isHeaderLine(line);
    if (header) {
      flush();
      cur = {
        name: header.name,
        time: header.time,
        mode: "",
        bands: "",
        exchange: "",
        cw: false,
        f: {},
      };
    }
  }
  flush();
  return items;
}

export function cwOnly(items: LiveContest[]): LiveContest[] {
  return items.filter((i) => i.cw);
}

// ---- client-side loader -----------------------------------------------------
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export async function loadLiveFeed(): Promise<LiveFeed | null> {
  try {
    const res = await fetch(`${BASE}/data/contests.json`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as LiveFeed;
  } catch {
    return null;
  }
}
