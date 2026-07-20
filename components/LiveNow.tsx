"use client";
import Link from "next/link";
import type { Contest, Instance, InstanceStatus, Station } from "@/lib/types";
import { renderExchange } from "@/lib/station";
import { hhmmZ, relative, dateLabel } from "@/lib/format";
import { CopyButton } from "./CopyButton";

export type LiveEntry = {
  contest: Contest;
  instance: Instance;
  status: InstanceStatus;
};

function Card({ e, station, now }: { e: LiveEntry; station: Station; now: Date }) {
  const live = e.status === "live";
  const soon = e.status === "soon";
  const youSend = renderExchange(e.contest, station);

  return (
    <div className={`livecard ${live ? "is-live" : soon ? "is-soon" : ""}`}>
      <div className="lc-top">
        <span className="lc-id">{e.contest.short}</span>
        {live ? (
          <span className="badge live">
            <span className="pulse" /> on air
          </span>
        ) : soon ? (
          <span className="badge soon">
            <span className="pulse" /> starting soon
          </span>
        ) : (
          <span className="badge">next up</span>
        )}
      </div>
      <div className="lc-name">{e.contest.name}</div>

      <div className="send-block">
        <div className="send-label-row">
          <div className="send-label">You send</div>
          <CopyButton text={youSend} label="Copy" className="btn copy-mini" />
        </div>
        <div className="send-value">{youSend}</div>
      </div>

      <div className="lc-meta">
        <span>
          <span className="k">win </span>
          {hhmmZ(e.instance.start)}–{hhmmZ(e.instance.end)}
        </span>
        <span>
          <span className="k">bands </span>
          {e.instance.bands.join(" ")}
        </span>
      </div>
      <div className="lc-when">
        {live
          ? `ends ${relative(e.instance.end, now)}`
          : `${dateLabel(e.instance.start)} · ${relative(e.instance.start, now)}`}
        {"  ·  "}
        <Link href={`/contests/${e.contest.id}/`} className="inline-link">
          details →
        </Link>
      </div>
    </div>
  );
}

export function LiveNow({
  entries,
  station,
  now,
}: {
  entries: LiveEntry[];
  station: Station;
  now: Date;
}) {
  return (
    <div className="live-strip">
      {entries.map((e) => (
        <Card key={e.contest.id + e.instance.start.toISOString()} e={e} station={station} now={now} />
      ))}
    </div>
  );
}
