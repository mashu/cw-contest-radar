"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Contest } from "@/lib/types";
import { waterfall } from "@/lib/colormap";
import { pad2 } from "@/lib/format";

export type WfRow = {
  contest: Contest;
  sendText: string;
  cells: number[]; // intensity 0..1 per day
  hours: number[]; // active hours per day
  highlight: boolean; // matches the current filter
};

type Tip = {
  x: number;
  y: number;
  short: string;
  name: string;
  date: string;
  hours: number;
  send: string;
} | null;

const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TIP_W = 260;
const TIP_H = 96;

function tipStyle(x: number, y: number): { left: number; top: number } {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const left = Math.max(8, Math.min(x + 14, vw - TIP_W - 8));
  // Prefer below the cursor; flip above when near the bottom of the viewport.
  const below = y + 16;
  const above = y - TIP_H - 12;
  const top =
    below + TIP_H > vh - 8
      ? Math.max(8, above)
      : Math.min(below, vh - TIP_H - 8);
  return { left, top };
}

export function Waterfall({
  rows,
  days,
  selectedIndex,
  onPickDay,
}: {
  rows: WfRow[];
  days: Date[];
  selectedIndex: number;
  onPickDay: (d: Date) => void;
}) {
  const [tip, setTip] = useState<Tip>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const n = days.length;
  const gutter = 104;
  const colW = n <= 7 ? 78 : n <= 14 ? 44 : 16;
  const rowH = 23;
  const axis = 40;
  const width = gutter + n * colW;
  const height = axis + rows.length * rowH + 8;
  const labelEvery = colW >= 40 ? 1 : 7;

  const tipNode =
    tip && mounted
      ? createPortal(
          <div className="wf-tooltip" style={tipStyle(tip.x, tip.y)} role="tooltip">
            <div className="t-id">{tip.short}</div>
            <div className="t-row" style={{ color: "var(--muted)", marginBottom: 4 }}>
              {tip.name}
            </div>
            <div className="t-row">
              {tip.date} ·{" "}
              {tip.hours >= 24 ? "all day" : `${Math.round(tip.hours)} h on air`}
            </div>
            <div className="t-row">
              you send <b>{tip.send}</b>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="waterfall-shell">
      <svg
        className="waterfall"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label="Timeline of CW contest activity by day"
        onMouseLeave={() => setTip(null)}
      >
        {days.map((d, j) => {
          const wknd = d.getUTCDay() === 0 || d.getUTCDay() === 6;
          const x = gutter + j * colW;
          return (
            <g key={`col-${j}`}>
              {wknd && (
                <rect
                  x={x}
                  y={axis - 6}
                  width={colW}
                  height={height - axis + 6}
                  fill="rgba(255,179,71,0.04)"
                />
              )}
              {j === selectedIndex && (
                <rect
                  x={x + 0.5}
                  y={axis - 6}
                  width={colW - 1}
                  height={height - axis + 4}
                  fill="rgba(47,227,200,0.06)"
                  stroke="var(--signal-2)"
                  strokeWidth={1}
                  rx={3}
                />
              )}
            </g>
          );
        })}

        {days.map((d, j) => {
          const x = gutter + j * colW + colW / 2;
          const showNum = j % labelEvery === 0 || j === selectedIndex;
          return (
            <g key={`ax-${j}`} fill="var(--faint)">
              <text
                x={x}
                y={16}
                textAnchor="middle"
                fontSize="9"
                fontFamily="var(--mono)"
                fill={d.getUTCDay() === 0 || d.getUTCDay() === 6 ? "var(--amber)" : "var(--faint)"}
              >
                {DOW[d.getUTCDay()]}
              </text>
              {showNum && (
                <text
                  x={x}
                  y={30}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontFamily="var(--mono)"
                  fill={j === selectedIndex ? "var(--signal)" : "var(--faint)"}
                >
                  {d.getUTCDate() === 1 ? MON[d.getUTCMonth()] : pad2(d.getUTCDate())}
                </text>
              )}
            </g>
          );
        })}

        <line
          x1={gutter}
          y1={axis - 6}
          x2={gutter}
          y2={height - 2}
          stroke="var(--signal)"
          strokeWidth={1.5}
          opacity={0.55}
        />
        <text x={gutter + 3} y={axis - 9} fontSize="8.5" fontFamily="var(--mono)" fill="var(--signal)">
          NOW
        </text>

        {rows.map((r, i) => {
          const y = axis + i * rowH;
          return (
            <g key={r.contest.id}>
              <text
                x={gutter - 10}
                y={y + rowH / 2 + 3.5}
                textAnchor="end"
                fontSize="11"
                fontFamily="var(--display)"
                fontWeight={600}
                fill={r.highlight ? "var(--signal)" : "var(--ink)"}
              >
                {r.contest.short}
              </text>
              {r.cells.map((v, j) => {
                if (v <= 0) return null;
                const x = gutter + j * colW;
                const day = days[j];
                if (!day) return null;
                return (
                  <rect
                    key={j}
                    x={x + 1}
                    y={y + 2}
                    width={colW - 2}
                    height={rowH - 4}
                    rx={2.5}
                    fill={waterfall(v)}
                    stroke={r.highlight ? "var(--signal)" : "none"}
                    strokeWidth={r.highlight ? 1 : 0}
                    style={{ cursor: "pointer" }}
                    onMouseMove={(ev) =>
                      setTip({
                        x: ev.clientX,
                        y: ev.clientY,
                        short: r.contest.short,
                        name: r.contest.name,
                        date: `${DOW[day.getUTCDay()]} ${day.getUTCDate()} ${MON[day.getUTCMonth()]}`,
                        hours: r.hours[j] ?? 0,
                        send: r.sendText,
                      })
                    }
                    onMouseLeave={() => setTip(null)}
                    onClick={() => onPickDay(day)}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="wf-legend">
        <span>quiet</span>
        <span className="bar" />
        <span>all-day</span>
        <span style={{ marginLeft: "auto" }}>hover a cell · click to set the date</span>
      </div>

      {tipNode}
    </div>
  );
}
