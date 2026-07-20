import type { Contest, Station } from "./types";

/** Example station used until the operator saves their own profile. */
export const DEFAULT_STATION: Station = {
  call: "SO5KM",
  name: "Mateusz",
  cqZone: "15",
  ituZone: "28",
  age: "34",
  grid: "KO00",
  province: "R",
  country: "POL",
  power: "100",
};

const KEY = "cw-radar-station";

export function loadStation(): Station {
  if (typeof window === "undefined") return DEFAULT_STATION;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATION;
    return { ...DEFAULT_STATION, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATION;
  }
}

export function saveStation(s: Station): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export function isDefaultStation(s: Station): boolean {
  return s.call === DEFAULT_STATION.call && s.name === DEFAULT_STATION.name;
}

// Letters-only prefix of a callsign (SO5KM -> "SO"), used for CWT/SST style
// exchanges that want your prefix / country rather than a full location.
export function lettersPrefix(call: string): string {
  const m = (call || "").toUpperCase().match(/^([A-Z]+)/);
  return m ? m[1] : "DX";
}

const TOKENS: Record<string, (s: Station) => string> = {
  rst: () => "599",
  serial: () => "001",
  name: (s) => s.name.toUpperCase(),
  prefix: (s) => lettersPrefix(s.call),
  age: (s) => s.age || "--",
  cq: (s) => s.cqZone || "--",
  itu: (s) => s.ituZone || "--",
  grid: (s) => (s.grid || "----").toUpperCase(),
  spc: (s) => (s.province || s.country || "DX").toUpperCase(),
  country: (s) => (s.country || "DX").toUpperCase(),
  province: (s) => (s.province || "--").toUpperCase(),
  power: (s) => s.power || "100",
};

export function renderExchange(contest: Contest, station: Station): string {
  return contest.exchange.youSend.replace(/\{(\w+)\}/g, (m, tok: string) => {
    const fn = TOKENS[tok];
    return fn ? fn(station) : m;
  });
}
