"use client";
import { useState } from "react";
import Link from "next/link";
import type { Contest, Instance, Station } from "@/lib/types";
import { statusOf } from "@/lib/recurrence";
import { renderExchange } from "@/lib/station";
import { Morse } from "./Morse";
import { CopyButton } from "./CopyButton";
import { dateLabel, hhmmZ, durationLabel, relative } from "@/lib/format";

// Illustrative "their" values for a worked example (clearly a sample).
const SAMPLE: Record<string, string> = {
  rst: "599",
  serial: "025",
  name: "JOE",
  prefix: "OK",
  age: "41",
  cq: "14",
  itu: "28",
  grid: "JN99",
  spc: "CZE",
  country: "CZE",
  province: "B",
  power: "5",
};

function sampleExchange(c: Contest): string {
  return c.exchange.youSend.replace(/\{(\w+)\}/g, (m, t: string) => SAMPLE[t] ?? m);
}

function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "contest website";
  }
}

function whenLabel(inst: Instance | null, now: Date) {
  if (!inst) return { cls: "", text: "no upcoming date in view" };
  const st = statusOf(inst, now);
  if (st === "live") {
    return { cls: "live", text: `on air now · ends ${relative(inst.end, now)}` };
  }
  if (st === "soon") {
    return { cls: "soon", text: `starts ${relative(inst.start, now)}` };
  }
  if (st === "later") {
    return {
      cls: "",
      text: `next ${dateLabel(inst.start)} ${hhmmZ(inst.start)} · ${relative(inst.start, now)}`,
    };
  }
  return { cls: "", text: `last ran ${dateLabel(inst.start)}` };
}

export function ContestCard({
  contest,
  occurrence,
  station,
  now,
  match,
}: {
  contest: Contest;
  occurrence: Instance | null;
  station: Station;
  now: Date;
  match: boolean;
}) {
  const [open, setOpen] = useState(true);
  const w = whenLabel(occurrence, now);
  const youSend = renderExchange(contest, station);
  const calendarOnly = contest.id.startsWith("cal-");

  return (
    <article className={`card ${match ? "match" : ""}`}>
      <div className="card-top">
        <div>
          <div className="card-id">{contest.short}</div>
          <Morse text={contest.short} />
        </div>
        <span className="card-tier">{calendarOnly ? "calendar" : contest.tier}</span>
      </div>
      <div className="card-name">{contest.name}</div>

      <div className="card-when">
        <span className={w.cls}>{w.text}</span>
        {occurrence ? (
          <>
            {"  ·  "}
            {contest.bands.slice(0, 6).join(" ")}
            {statusOf(occurrence, now) === "live"
              ? ""
              : `  ·  ${durationLabel(occurrence.end.getTime() - occurrence.start.getTime())}`}
          </>
        ) : null}
      </div>

      <div className="card-meta">
        <span>
          <span className="k">CQ </span>
          {contest.cq}
        </span>
        <span>
          <span className="k">bands </span>
          {contest.bands.map((b) => `${b}m`).join(" ")}
        </span>
      </div>

      <div className="card-send">
        <span className="k">You send</span>
        <div className="card-send-row">
          <span>{youSend}</span>
          <CopyButton text={youSend} label="Copy" className="btn copy-mini" />
        </div>
        <p className="card-note">{contest.exchange.note}</p>
      </div>

      {open && (
        <div className="qso">
          <div className="qso-caption">Worked example</div>
          <div className="qso-line them">
            <span className="who">them</span>
            <span className="txt">
              {contest.cq} DE {SAMPLE.prefix}1WC
            </span>
          </div>
          <div className="qso-line you">
            <span className="who">you</span>
            <span className="txt">{station.call}</span>
          </div>
          <div className="qso-line them">
            <span className="who">them</span>
            <span className="txt">
              {station.call} {sampleExchange(contest)}
            </span>
          </div>
          <div className="qso-line you">
            <span className="who">you</span>
            <span className="txt">{youSend} TU</span>
          </div>
        </div>
      )}

      <div className="card-links">
        <a className="btn" href={contest.rules} target="_blank" rel="noreferrer">
          Rules · {hostLabel(contest.rules)} ↗
        </a>
        <a className="btn" href={contest.logs.url} target="_blank" rel="noreferrer">
          Submit log ↗
        </a>
      </div>

      <div className="card-foot">
        {calendarOnly ? (
          <a className="btn primary" href={contest.rules} target="_blank" rel="noreferrer">
            Contest website ↗
          </a>
        ) : (
          <Link className="btn primary" href={`/contests/${contest.id}/`}>
            Full details
          </Link>
        )}
        <button type="button" className="btn" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide example" : "Show example"}
        </button>
      </div>
    </article>
  );
}
