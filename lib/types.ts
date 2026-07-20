// ---- Recurrence descriptors -------------------------------------------------
// Weekly sessions: `days` are UTC weekdays (0=Sun .. 6=Sat). `start`/`end` are
// "HHMM" UTC on that weekday; if end <= start the window wraps past midnight.
export type WeeklySession = {
  days: number[];
  start: string; // "HHMM"
  end: string; // "HHMM"
  bands?: string[];
};
export type Weekly = { kind: "weekly"; sessions: WeeklySession[] };

// Annual sessions are anchored to a Saturday in `month` (0=Jan .. 11=Dec):
//   rule "fullWeekend" -> the nth Saturday whose Sunday is still in the month
//   rule "saturday"    -> the plain nth Saturday
// n is 1-indexed or "last". Each session is expressed relative to that Saturday
// at 00:00Z: startH may be negative (e.g. -2 = Friday 22:00Z).
export type AnnualSession = {
  startH: number;
  startM?: number;
  durationH: number;
  durationM?: number;
  bands?: string[];
};
export type Annual = {
  kind: "annual";
  month: number;
  rule: "fullWeekend" | "saturday";
  n: number | "last";
  sessions: AnnualSession[];
};

// Explicit UTC windows for contests whose dates are announced yearly (e.g. YOTA).
export type ManualWindow = { start: string; end: string; bands?: string[] };
export type Manual = { kind: "manual"; windows: ManualWindow[] };

export type Recurrence = Weekly | Annual | Manual;

// ---- Contest ----------------------------------------------------------------
export type Exchange = {
  // Template with {tokens}: {rst} {serial} {name} {prefix} {age} {cq} {itu}
  // {grid} {spc} {country} {province} {power}
  youSend: string;
  note: string;
  rst: boolean;
};

export type Contest = {
  id: string;
  name: string;
  short: string; // marquee identifier, e.g. "CWT"
  cq: string; // what you call, e.g. "CQ CWT"
  aliases: string[]; // what you might copy off the air
  bands: string[]; // e.g. ["160","80","40","20","15","10"] or ["40","80"]
  exchange: Exchange;
  logs: { url: string; deadline?: string };
  rules: string;
  tip?: string;
  tier: "major" | "sprint" | "regional"; // drives ordering + heatmap weight
  recurrence: Recurrence | Recurrence[];
};

// A concrete occurrence produced by expanding a contest's recurrence.
export type Instance = {
  contestId: string;
  start: Date;
  end: Date;
  bands: string[];
};

export type InstanceStatus = "live" | "soon" | "later" | "past";

// ---- Station profile --------------------------------------------------------
export type Station = {
  call: string;
  name: string;
  cqZone: string;
  ituZone: string;
  age: string;
  grid: string;
  province: string; // e.g. SP DX province letter
  country: string; // short country tag for SPC-style exchanges
  power: string; // watts
};

// ---- Live feed (from CI-pulled WA7BNM weeklycal.txt) -------------------------
export type LiveContest = {
  name: string;
  time: string;
  mode: string;
  bands: string;
  exchange: string;
  rules?: string;
  log?: string;
  deadline?: string;
  cw: boolean;
};

export type LiveFeed = {
  generatedAt: string; // ISO
  source: string;
  items: LiveContest[];
};
