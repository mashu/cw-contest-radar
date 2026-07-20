"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CONTESTS, matchesHeard } from "@/lib/contests";
import { DEFAULT_STATION, loadStation, renderExchange } from "@/lib/station";
import { STATION_EVENT } from "./StationControl";
import { Morse } from "./Morse";
import type { Station } from "@/lib/types";

const TIERS = ["all", "major", "sprint", "regional"] as const;

export function ContestBrowser() {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<(typeof TIERS)[number]>("all");
  const [station, setStation] = useState<Station>(DEFAULT_STATION);

  useEffect(() => {
    setStation(loadStation());
    const on = () => setStation(loadStation());
    window.addEventListener(STATION_EVENT, on);
    return () => window.removeEventListener(STATION_EVENT, on);
  }, []);

  const list = useMemo(() => {
    return CONTESTS.filter((c) => {
      if (tier !== "all" && c.tier !== tier) return false;
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
  }, [q, tier]);

  return (
    <>
      <section className="wrap hero">
        <div className="eyebrow">Contest index</div>
        <h1 className="hero-lede">
          Every CW contest, <em>and how to answer it.</em>
        </h1>
        <p className="hero-note">
          Search by name, CQ call, band, or what you&apos;d hear on the air. Each
          entry links to the full schedule, exchange and rules — personalized
          from your station profile.
        </p>
        <div className="tuner tuner-browse">
          <div className="tuner-cell">
            <label htmlFor="q">Search</label>
            <input
              id="q"
              value={q}
              placeholder="WPX, slow speed, 160…"
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
            {list.map((c) => (
              <Link key={c.id} href={`/contests/${c.id}/`} className="card card-link">
                <div className="card-top">
                  <div>
                    <div className="card-id">{c.short}</div>
                    <Morse text={c.short} />
                  </div>
                  <span className="card-tier">{c.tier}</span>
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
              </Link>
            ))}
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
