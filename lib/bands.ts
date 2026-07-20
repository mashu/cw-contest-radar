// HF/6m band plan with the CW portions operators actually use for contesting.
export type Band = {
  key: string; // "20"
  label: string; // "20m"
  lo: number; // band edge low (MHz)
  hi: number; // band edge high (MHz)
  cwLo: number; // typical CW/contest sub-band
  cwHi: number;
  warc: boolean; // WARC bands carry no contests
};

export const BANDS: Band[] = [
  { key: "160", label: "160m", lo: 1.8, hi: 2.0, cwLo: 1.8, cwHi: 1.84, warc: false },
  { key: "80", label: "80m", lo: 3.5, hi: 4.0, cwLo: 3.5, cwHi: 3.6, warc: false },
  { key: "40", label: "40m", lo: 7.0, hi: 7.3, cwLo: 7.0, cwHi: 7.04, warc: false },
  { key: "30", label: "30m", lo: 10.1, hi: 10.15, cwLo: 10.1, cwHi: 10.13, warc: true },
  { key: "20", label: "20m", lo: 14.0, hi: 14.35, cwLo: 14.0, cwHi: 14.07, warc: false },
  { key: "17", label: "17m", lo: 18.068, hi: 18.168, cwLo: 18.068, cwHi: 18.095, warc: true },
  { key: "15", label: "15m", lo: 21.0, hi: 21.45, cwLo: 21.0, cwHi: 21.07, warc: false },
  { key: "12", label: "12m", lo: 24.89, hi: 24.99, cwLo: 24.89, cwHi: 24.915, warc: true },
  { key: "10", label: "10m", lo: 28.0, hi: 29.7, cwLo: 28.0, cwHi: 28.1, warc: false },
  { key: "6", label: "6m", lo: 50.0, hi: 54.0, cwLo: 50.0, cwHi: 50.1, warc: false },
];

// Parse a typed frequency. Heuristic: a bare number >= 100 is kHz, otherwise MHz.
// Accepts commas, spaces, and unit suffixes ("14028", "14.028", "7,028 kHz").
export function parseFreq(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.toLowerCase().replace(/[, ]+/g, "").replace(/khz|mhz|hz/g, "");
  if (!/[0-9]/.test(cleaned)) return null;
  const v = parseFloat(cleaned);
  if (!isFinite(v) || v <= 0) return null;
  const mhz = v >= 100 ? v / 1000 : v;
  return Math.round(mhz * 1000) / 1000;
}

export function bandFor(mhz: number | null): Band | null {
  if (mhz == null) return null;
  return BANDS.find((b) => mhz >= b.lo - 1e-9 && mhz <= b.hi + 1e-9) ?? null;
}

export function bandByKey(key: string): Band | null {
  return BANDS.find((b) => b.key === key) ?? null;
}
