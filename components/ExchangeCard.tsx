"use client";
import { useEffect, useState } from "react";
import type { Contest, Instance, Station } from "@/lib/types";
import { DEFAULT_STATION, loadStation, renderExchange } from "@/lib/station";
import { expandContest, statusOf } from "@/lib/recurrence";
import { STATION_EVENT } from "./StationControl";
import { CopyButton } from "./CopyButton";
import { dateLabel, hhmmZ, relative, durationLabel } from "@/lib/format";

export function ExchangeCard({ contest }: { contest: Contest }) {
  const [station, setStation] = useState<Station>(DEFAULT_STATION);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setStation(loadStation());
    setNow(new Date());
    const on = () => setStation(loadStation());
    window.addEventListener(STATION_EVENT, on);
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => {
      window.removeEventListener(STATION_EVENT, on);
      clearInterval(id);
    };
  }, []);

  const youSend = renderExchange(contest, station);
  let upcoming: Instance[] = [];
  if (now) {
    upcoming = expandContest(
      contest,
      new Date(now.getTime() - 2 * 86400000),
      new Date(now.getTime() + 300 * 86400000)
    )
      .filter((i) => i.end.getTime() >= now.getTime())
      .slice(0, 6);
  }

  return (
    <>
      <div className="panel">
        <div className="send-label-row" style={{ marginBottom: 10 }}>
          <h4 style={{ margin: 0 }}>You send</h4>
          <CopyButton text={youSend} label="Copy exchange" className="btn copy-mini" />
        </div>
        <div className="big-send">{youSend}</div>
        <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 0 }}>
          {contest.exchange.note}
        </p>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <h4>Upcoming sessions (UTC)</h4>
        {!now ? (
          <div className="feed-status">computing…</div>
        ) : upcoming.length === 0 ? (
          <div className="feed-status">No sessions in the next several months.</div>
        ) : (
          <div className="feed-list">
            {upcoming.map((i, k) => {
              const st = statusOf(i, now);
              return (
                <div className="feed-row" key={k}>
                  <div>
                    <div className="fn">{dateLabel(i.start)}</div>
                    <div className="fx">
                      {hhmmZ(i.start)}–{hhmmZ(i.end)} ·{" "}
                      {durationLabel(i.end.getTime() - i.start.getTime())} · {i.bands.join(" ")}
                    </div>
                  </div>
                  <div className="ft" style={st === "live" ? { color: "var(--live)" } : undefined}>
                    {st === "live" ? "on air" : relative(i.start, now)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
