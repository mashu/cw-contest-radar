"use client";
import type { Contest } from "@/lib/types";

export type TlRow = {
  contest: Contest;
  segments: { a: number; b: number; bands: string[]; live: boolean }[];
  highlight: boolean;
};

export function DayTimeline({
  rows,
  nowFrac,
}: {
  rows: TlRow[];
  nowFrac: number | null; // 0..1 if the selected day is today, else null
}) {
  const gutter = 104;
  const rowH = 30;
  const axis = 26;
  const plot = 760;
  const width = gutter + plot;
  const height = axis + Math.max(rows.length, 1) * rowH + 6;
  const xOf = (f: number) => gutter + f * plot;

  return (
    <div className="timeline-shell">
      <svg
        className="timeline"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label="24-hour timeline of contest activity"
      >
        {/* hour grid */}
        {Array.from({ length: 7 }, (_, k) => k * 4).map((h) => {
          const x = xOf(h / 24);
          return (
            <g key={h}>
              <line x1={x} y1={axis - 4} x2={x} y2={height - 2} stroke="var(--line)" strokeWidth={1} />
              <text x={x} y={14} textAnchor="middle" fontSize="9.5" fontFamily="var(--mono)" fill="var(--faint)">
                {String(h).padStart(2, "0")}
              </text>
            </g>
          );
        })}
        <text x={width - 2} y={14} textAnchor="end" fontSize="9.5" fontFamily="var(--mono)" fill="var(--faint)">
          UTC
        </text>

        {rows.length === 0 && (
          <text x={gutter} y={axis + 22} fontSize="12" fontFamily="var(--body)" fill="var(--muted)">
            No CW contests scheduled on this date.
          </text>
        )}

        {rows.map((r, i) => {
          const y = axis + i * rowH;
          return (
            <g key={r.contest.id}>
              <text
                x={gutter - 10}
                y={y + rowH / 2 + 1}
                textAnchor="end"
                fontSize="11"
                fontFamily="var(--display)"
                fontWeight={600}
                fill={r.highlight ? "var(--signal)" : "var(--ink)"}
              >
                {r.contest.short}
              </text>
              {r.segments.map((s, j) => {
                const x = xOf(s.a);
                const w = Math.max(3, xOf(s.b) - xOf(s.a));
                return (
                  <g key={j}>
                    <rect
                      x={x}
                      y={y + 5}
                      width={w}
                      height={rowH - 14}
                      rx={4}
                      fill={s.live ? "rgba(255,90,68,0.22)" : "var(--signal-dim)"}
                      stroke={s.live ? "var(--live)" : "var(--signal-2)"}
                      strokeWidth={1}
                    />
                    {w > 46 && (
                      <text
                        x={x + 6}
                        y={y + rowH / 2 + 1}
                        fontSize="9.5"
                        fontFamily="var(--mono)"
                        fill={s.live ? "var(--live)" : "var(--signal)"}
                      >
                        {s.bands.join(" ")}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {nowFrac != null && nowFrac >= 0 && nowFrac <= 1 && (
          <g>
            <line
              x1={xOf(nowFrac)}
              y1={axis - 4}
              x2={xOf(nowFrac)}
              y2={height - 2}
              stroke="var(--signal)"
              strokeWidth={1.5}
            />
            <circle cx={xOf(nowFrac)} cy={axis - 4} r={3} fill="var(--signal)" />
          </g>
        )}
      </svg>
    </div>
  );
}
