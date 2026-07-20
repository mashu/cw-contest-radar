"use client";
import { useEffect, useMemo, useState } from "react";
import { CONTESTS, contestById, matchesHeard } from "@/lib/contests";
import { expandAll, relevantInstance, statusOf } from "@/lib/recurrence";
import { bandFor, parseFreq } from "@/lib/bands";
import { dayIntensity } from "@/lib/colormap";
import {
  DEFAULT_STATION,
  isDefaultStation,
  loadStation,
  renderExchange,
} from "@/lib/station";
import { loadLiveFeed } from "@/lib/feed";
import { allContestsWithExtras, calendarExtras } from "@/lib/calendarMerge";
import type { Contest, Instance, InstanceStatus, LiveFeed, Station } from "@/lib/types";
import {
  dateInputValue,
  dateLabel,
  dayKey,
  parseDateInput,
} from "@/lib/format";
import { STATION_EVENT } from "./StationControl";
import { TuningBar } from "./TuningBar";
import { LiveNow, type LiveEntry } from "./LiveNow";
import { Waterfall, type WfRow } from "./Waterfall";
import { DayTimeline, type TlRow } from "./DayTimeline";
import { ContestCard } from "./ContestCard";
import { LiveFeedPanel } from "./LiveFeedPanel";

const DAY = 86400000;
const RANGE_DAYS: Record<string, number> = { wk: 7, "2wk": 14, "6wk": 42 };
const TIER_WEIGHT: Record<Contest["tier"], number> = {
  major: 1.0,
  regional: 0.92,
  sprint: 0.85,
};
const STATUS_RANK: Record<InstanceStatus, number> = { live: 0, soon: 1, later: 2, past: 3 };

function startOfUTCDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function overlapHours(inst: Instance, from: number, to: number): number {
  const a = Math.max(inst.start.getTime(), from);
  const b = Math.min(inst.end.getTime(), to);
  return b > a ? (b - a) / 3600000 : 0;
}

export function Dashboard() {
  const [now, setNow] = useState<Date | null>(null);
  const [dateStr, setDateStr] = useState("");
  const [heard, setHeard] = useState("");
  const [freq, setFreq] = useState("");
  const [wfRange, setWfRange] = useState<"wk" | "2wk" | "6wk">("2wk");
  const [station, setStation] = useState<Station>(DEFAULT_STATION);
  const [feed, setFeed] = useState<LiveFeed | null>(null);
  const [feedLoaded, setFeedLoaded] = useState(false);

  useEffect(() => {
    const d = new Date();
    setNow(d);
    setDateStr(dateInputValue(d));
    setStation(loadStation());
    const tick = setInterval(() => setNow(new Date()), 60000);
    const onStation = () => setStation(loadStation());
    window.addEventListener(STATION_EVENT, onStation);
    loadLiveFeed().then((f) => {
      setFeed(f);
      setFeedLoaded(true);
    });
    return () => {
      clearInterval(tick);
      window.removeEventListener(STATION_EVENT, onStation);
    };
  }, []);

  const nowKey = now ? dayKey(now) : "";
  const extras = useMemo(() => calendarExtras(feed), [feed]);
  const catalog = useMemo(() => allContestsWithExtras(extras.contests), [extras]);
  const byId = useMemo(() => {
    const m = new Map<string, Contest>();
    for (const c of catalog) m.set(c.id, c);
    return m;
  }, [catalog]);
  const lookup = (id: string) => byId.get(id) ?? contestById(id);

  const { allInstances, byContest } = useMemo(() => {
    if (!now) return { allInstances: [] as Instance[], byContest: new Map<string, Instance[]>() };
    const from = new Date(startOfUTCDay(now).getTime() - 2 * DAY);
    const to = new Date(startOfUTCDay(now).getTime() + 71 * DAY);
    const all = [...expandAll(CONTESTS, from, to), ...extras.instances];
    const map = new Map<string, Instance[]>();
    for (const i of all) {
      const arr = map.get(i.contestId) ?? [];
      arr.push(i);
      map.set(i.contestId, arr);
    }
    return { allInstances: all, byContest: map };
  }, [nowKey, extras]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!now || !dateStr) {
    return (
      <div className="wrap hero">
        <div className="eyebrow">CW contest radar</div>
        <div className="hero-lede">Tuning in…</div>
      </div>
    );
  }

  const selectedDate = parseDateInput(dateStr);
  const isToday = dayKey(selectedDate) === dayKey(now);
  const dayStart = selectedDate.getTime();

  const freqMhz = parseFreq(freq);
  const band = bandFor(freqMhz);
  const bandWarn = !!freq && !band;
  const bandKey = band && !band.warc ? band.key : null;
  const heardTrim = heard.trim();
  const heardMatches = heardTrim ? catalog.filter((c) => matchesHeard(c, heard)) : [];
  const heardHint =
    heardTrim && heardMatches.length
      ? heardMatches.map((c) => c.short).slice(0, 3).join(", ")
      : null;

  const hasFilter = !!heardTrim || !!bandKey;
  const contestMatches = (c: Contest) => {
    const h = heardTrim ? matchesHeard(c, heard) : true;
    const f = bandKey ? c.bands.includes(bandKey) : true;
    return h && f;
  };
  const matchSet = new Set(catalog.filter(contestMatches).map((c) => c.id));

  const dayInsts = allInstances.filter(
    (i) => i.end.getTime() > dayStart && i.start.getTime() < dayStart + DAY
  );
  const toEntry = (i: Instance): LiveEntry | null => {
    const contest = lookup(i.contestId);
    if (!contest) return null;
    return { contest, instance: i, status: statusOf(i, now) };
  };

  let entries: LiveEntry[];
  let liveTitle: string;
  if (isToday) {
    const liveOnes = dayInsts
      .filter((i) => statusOf(i, now) === "live")
      .map(toEntry)
      .filter((e): e is LiveEntry => !!e);
    const soonOnes = dayInsts
      .filter((i) => statusOf(i, now) === "soon")
      .map(toEntry)
      .filter((e): e is LiveEntry => !!e);
    if (liveOnes.length) {
      entries = [...liveOnes, ...soonOnes];
      liveTitle = "On air now";
    } else if (soonOnes.length) {
      entries = soonOnes;
      liveTitle = "Starting soon";
    } else {
      const up = allInstances
        .filter((i) => i.start.getTime() >= now.getTime())
        .sort((a, b) => a.start.getTime() - b.start.getTime());
      const next = up[0] ? toEntry(up[0]) : null;
      entries = next ? [next] : [];
      liveTitle = "Next up";
    }
  } else {
    entries = dayInsts
      .slice()
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .map(toEntry)
      .filter((e): e is LiveEntry => !!e)
      .map((e) => ({ ...e, status: "later" as const }));
    liveTitle = `Scheduled — ${dateLabel(selectedDate)}`;
  }

  const n = RANGE_DAYS[wfRange] ?? 14;
  const rangeStart = startOfUTCDay(now).getTime();
  const days: Date[] = Array.from({ length: n }, (_, j) => new Date(rangeStart + j * DAY));
  const selectedIndex = Math.round((dayStart - rangeStart) / DAY);
  const selInRange = selectedIndex >= 0 && selectedIndex < n;

  const wfRows: WfRow[] = [];
  for (const c of catalog) {
    const insts = byContest.get(c.id) ?? [];
    const hours = days.map((d) => {
      const s = d.getTime();
      return insts.reduce((acc, i) => acc + overlapHours(i, s, s + DAY), 0);
    });
    const total = hours.reduce((a, b) => a + b, 0);
    if (total <= 0) continue;
    const w = TIER_WEIGHT[c.tier];
    wfRows.push({
      contest: c,
      sendText: renderExchange(c, station),
      cells: hours.map((h) => dayIntensity(Math.min(h, 24), w)),
      hours,
      highlight: hasFilter && matchSet.has(c.id),
    });
  }
  wfRows.sort((a, b) => {
    if (a.highlight !== b.highlight) return a.highlight ? -1 : 1;
    const tw = TIER_WEIGHT[b.contest.tier] - TIER_WEIGHT[a.contest.tier];
    if (tw !== 0) return tw;
    return a.contest.short.localeCompare(b.contest.short);
  });

  const tlMap = new Map<string, TlRow>();
  for (const i of dayInsts) {
    const c = lookup(i.contestId);
    if (!c) continue;
    const row =
      tlMap.get(c.id) ??
      ({ contest: c, segments: [], highlight: hasFilter && matchSet.has(c.id) } as TlRow);
    row.segments.push({
      a: Math.max(0, (i.start.getTime() - dayStart) / DAY),
      b: Math.min(1, (i.end.getTime() - dayStart) / DAY),
      bands: i.bands,
      live: isToday && statusOf(i, now) === "live",
    });
    tlMap.set(c.id, row);
  }
  const tlRows = Array.from(tlMap.values()).sort(
    (a, b) => (a.segments[0]?.a ?? 0) - (b.segments[0]?.a ?? 0)
  );
  const nowFrac = isToday ? (now.getTime() - dayStart) / DAY : null;

  const listContests = hasFilter ? catalog.filter(contestMatches) : catalog.slice();
  const cards = listContests
    .map((c) => {
      const occ = relevantInstance(byContest.get(c.id) ?? [], now);
      return { contest: c, occ };
    })
    .sort((a, b) => {
      const sa = a.occ ? STATUS_RANK[statusOf(a.occ, now)] : 4;
      const sb = b.occ ? STATUS_RANK[statusOf(b.occ, now)] : 4;
      if (sa !== sb) return sa - sb;
      const ta = a.occ ? a.occ.start.getTime() : Infinity;
      const tb = b.occ ? b.occ.start.getTime() : Infinity;
      return ta - tb;
    });

  const showProfileNudge = isDefaultStation(station);
  const calOnly = extras.contests.length;

  return (
    <>
      <section className="wrap hero">
        <div className="eyebrow">
          CW contest radar · {isToday ? "live" : dateLabel(selectedDate)}
        </div>
        <h1 className="hero-lede">
          What CW contest is on, <em>and what do I send back?</em>
        </h1>
        <p className="hero-note">
          Paste what you copied off the air, punch in a frequency, or pick a date.
          Built-in schedules run offline; this week&apos;s WA7BNM calendar fills any
          gaps automatically.
          {calOnly ? (
            <>
              {" "}
              <span className="mono" style={{ color: "var(--signal)" }}>
                +{calOnly} from calendar
              </span>
            </>
          ) : null}
        </p>
        {showProfileNudge ? (
          <p className="profile-nudge" role="status">
            Showing sample exchanges for <b>{DEFAULT_STATION.call}</b>. Open{" "}
            <b>set your call</b> in the header to personalize every &ldquo;you
            send&rdquo; line.
          </p>
        ) : null}
        <TuningBar
          heard={heard}
          freq={freq}
          dateStr={dateStr}
          bandLabel={
            band
              ? `${band.label}${band.warc ? " · WARC (no contests)" : " · CW segment"}`
              : null
          }
          bandWarn={bandWarn}
          heardHint={heardHint}
          onHeard={setHeard}
          onFreq={setFreq}
          onDate={setDateStr}
          onToday={() => {
            setDateStr(dateInputValue(new Date()));
            setHeard("");
            setFreq("");
          }}
        />
      </section>

      <section className="wrap section">
        <div className="section-head">
          <span className="section-title">{liveTitle}</span>
          <span className="section-count">{entries.length} shown</span>
        </div>
        {entries.length ? (
          <LiveNow entries={entries} station={station} now={now} />
        ) : (
          <div className="empty">
            Nothing scheduled at that moment. Try the <b>6wk</b> timeline below to
            find the next activity.
          </div>
        )}
      </section>

      <section className="wrap section">
        <div className="section-head">
          <span className="section-title">Timeline</span>
          <span className="section-count">
            {wfRows.length} contests · from today
          </span>
          <div className="section-tools">
            <span className="seg">
              {(["wk", "2wk", "6wk"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={wfRange === r ? "on" : ""}
                  onClick={() => setWfRange(r)}
                >
                  {r}
                </button>
              ))}
            </span>
          </div>
        </div>
        <Waterfall
          rows={wfRows}
          days={days}
          selectedIndex={selInRange ? selectedIndex : -1}
          onPickDay={(d) => setDateStr(dateInputValue(d))}
        />
      </section>

      <section className="wrap section">
        <div className="section-head">
          <span className="section-title">{dateLabel(selectedDate)} · 24-hour view</span>
          <span className="section-count">{tlRows.length} on this day</span>
        </div>
        <DayTimeline rows={tlRows} nowFrac={nowFrac} />
      </section>

      <section className="wrap section">
        <div className="section-head">
          <span className="section-title">
            {hasFilter ? "Matching contests" : "All CW contests"}
          </span>
          <span className="section-count">{cards.length} shown</span>
        </div>
        {cards.length ? (
          <div className="cards">
            {cards.map(({ contest, occ }) => (
              <ContestCard
                key={contest.id}
                contest={contest}
                occurrence={occ}
                station={station}
                now={now}
                match={hasFilter && matchSet.has(contest.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty">
            Nothing matches <b>{heardTrim || band?.label}</b>. Clear the filters to
            see the full list.
          </div>
        )}
      </section>

      <section className="wrap section">
        <div className="section-head">
          <span className="section-title">This week — live feed</span>
          <span className="section-count">WA7BNM, refreshed by CI</span>
        </div>
        <LiveFeedPanel feed={feed} loaded={feedLoaded} />
      </section>
    </>
  );
}
