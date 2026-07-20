// SDR-waterfall colormap: transparent -> deep teal -> bright teal -> amber -> hot.
// Input t in [0,1]. Returns an rgba() string. Keeps the palette to the two brand
// accents (teal + amber) so the heatmap reads like a real spectrum display.
type Stop = { t: number; c: [number, number, number, number] };
const STOPS: Stop[] = [
  { t: 0.0, c: [10, 18, 24, 0] },
  { t: 0.2, c: [13, 52, 60, 0.5] },
  { t: 0.45, c: [22, 140, 134, 0.82] },
  { t: 0.65, c: [47, 227, 200, 0.95] },
  { t: 0.82, c: [255, 179, 71, 0.95] },
  { t: 1.0, c: [255, 120, 70, 1] },
];

function lerp(a: number, b: number, u: number) {
  return a + (b - a) * u;
}

export function waterfall(t: number): string {
  const x = Math.max(0, Math.min(1, t));
  for (let i = 1; i < STOPS.length; i++) {
    if (x <= STOPS[i].t) {
      const lo = STOPS[i - 1];
      const hi = STOPS[i];
      const u = (x - lo.t) / (hi.t - lo.t || 1);
      const r = Math.round(lerp(lo.c[0], hi.c[0], u));
      const g = Math.round(lerp(lo.c[1], hi.c[1], u));
      const b = Math.round(lerp(lo.c[2], hi.c[2], u));
      const a = lerp(lo.c[3], hi.c[3], u);
      return `rgba(${r},${g},${b},${a.toFixed(3)})`;
    }
  }
  const last = STOPS[STOPS.length - 1].c;
  return `rgba(${last[0]},${last[1]},${last[2]},${last[3]})`;
}

// Map hours of contest activity on a given day (plus a tier weight) to intensity,
// with a visibility floor so even a one-hour sprint shows as a tick.
export function dayIntensity(hours: number, tierWeight: number): number {
  if (hours <= 0) return 0;
  const base = 0.3 + Math.min(1, hours / 14) * 0.7;
  return Math.max(0, Math.min(1, base * tierWeight));
}
