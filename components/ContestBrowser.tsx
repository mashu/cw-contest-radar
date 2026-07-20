"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { matchesHeard } from "@/lib/contests";
import { DEFAULT_STATION, loadStation, renderExchange } from "@/lib/station";
import { loadLiveFeed } from "@/lib/feed";
import { mergeCalendarFeed } from "@/lib/calendarMerge";
import { STATION_EVENT } from "./StationControl";
import { Morse } from "./Morse";
import type { LiveFeed, Station } from "@/lib/types";

const TIERS = ["all", "major", "sprint", "regional", "calendar"] as const;

export function ContestBrowser() {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<(typeof TIERS)[number]>("all");
  const [station, setStation] = useState<Station>(DEFAULT_STATION);
  const [feed, setFeed] = useState<LiveFeed | null>(null);

  useEffect(() => {
    setStation(loadStation());
    const on = () => setStation(loadStation());
    window.addEventListener(STATION_EVENT, on);
    loadLiveFeed().then(setFeed);
    return () => window.removeEventListener(STATION_EVENT, on);
  }, []);

  const catalog = useMemo(() => mergeCalendarFeed(feed).contests, [feed]);

  const list = useMemo(() => {
    return catalog.filter((c) => {
      if (tier === "calendar") {
        if (!c.id.startsWith("cal-")) return false;
      } else if (tier !== "all") {
        if (c.id.startsWith("cal-") || c.tier !== tier) return false;
      }
      if (!q.trim()) return true;
      const ql = q.trim().toLowerCase();
      return (
        c.name.toLowerCase().includes(ql) ||
        c.short.toLowerCase().includes(ql) ||
        c.cq.toLowerCase().includes(ql) ||
        c.bands.some((b) => b === ql || `${b}m` === ql) ||
        matchesHeard(c, q)
      );
    });
  }, [q, tier, catalog]);

  return (
    <>
      <section className="wrap hero">
        <div className="eyebrow">Contest index</div>
        <h1 className="hero-lede">
          Every CW contest, <em>and how to answer it.</em>
        </h1>
        <p className="hero-note">
          Built-in contests plus everything CW on this week&apos;s WA7BNM calendar.
          Unlisted events still appear — with whatever exchange/rules the calendar
          published.
        </p>
        <div className="tuner tuner-browse">
          <div className="tuner-cell">
            <label htmlFor="q">Search</label>
            <input
              id="q"
              value={q}
              placeholder="TTC, WPX, fox hunt…"
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="tuner-readout">{list.length} contests</div>
          </div>
          <div className="tuner-cell">
            <label>Type</label>
            <div className="quicktags" style={{ marginTop: 4 }}>
              {TIERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`chip ${tier === t ? "on" : ""}`}
                  onClick={() => setTier(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="wrap section">
        {list.length ? (
          <div className="cards">
            {list.map((c) => {
              const cal = c.id.startsWith("cal-");
              const inner = (
                <>
                  <div className="card-top">
                    <div>
                      <div className="card-id">{c.short}</div>
                      <Morse text={c.short} />
                    </div>
                    <span className="card-tier">{cal ? "calendar" : c.tier}</span>
                  </div>
                  <div className="card-name">{c.name}</div>
                  <div className="card-send">
                    <span className="k">You send</span>
                    {renderExchange(c, station)}
                  </div>
                  <div className="card-when">{c.exchange.note}</div>
                  <div className="card-links">
                    <span
                      className="btn copy-mini"
                      role="link"
                      tabIndex={0}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(c.rules, "_blank", "noopener,noreferrer");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(c.rules, "_blank", "noopener,noreferrer");
                        }
                      }}
                    >
                      Rules ↗
                    </span>
                  </div>
                </>
              );
              return cal ? (
                <a
                  key={c.id}
                  href={c.rules}
                  target="_blank"
                  rel="noreferrer"
                  className="card card-link"
                >
                  {inner}
                </a>
              ) : (
                <Link key={c.id} href={`/contests/${c.id}/`} className="card card-link">
                  {inner}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="empty">
            Nothing matches <b>{q || tier}</b>. Clear search or pick another type.
          </div>
        )}
      </section>
    </>
  );
}
