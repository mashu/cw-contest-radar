import type { Metadata } from "next";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "About · CW Contest Radar",
  description: "How the radar gets its data, and how to subscribe by RSS or calendar.",
};

export default function AboutPage() {
  return (
    <section className="wrap" style={{ paddingTop: 30, maxWidth: 820 }}>
      <div className="eyebrow">About</div>
      <h1 className="hero-lede">Two layers of data, no server required.</h1>

      <div className="panel" style={{ marginTop: 20 }}>
        <h4>Where the schedule comes from</h4>
        <p style={{ marginTop: 0 }}>
          The radar carries a hand-verified database of CW contests with their
          recurrence rules — &ldquo;last full weekend of November&rdquo;, &ldquo;every Wednesday
          1300Z&rdquo;, and so on. Every occurrence is computed in your browser, so the
          the timeline, the 24-hour view and the exchanges all work with no network and
          for any date you pick.
        </p>
        <p style={{ marginBottom: 0 }}>
          On top of that, a scheduled job pulls the current week from the WA7BNM
          Contest Calendar, filters it to CW, and commits it as static JSON. That
          keeps the &ldquo;this week&rdquo; feed fresh and catches one-off events the built-in
          rules don&apos;t know about.
        </p>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <h4>Subscribe</h4>
        <p style={{ marginTop: 0 }}>
          The same job regenerates two static files whenever the data changes:
        </p>
        <dl className="kv">
          <dt>RSS</dt>
          <dd>
            <a href={`${BASE}/feed.xml`}>{`${BASE || ""}/feed.xml`}</a> — point any
            reader at it for the next few months of CW contests.
          </dd>
          <dt>Calendar</dt>
          <dd>
            <a href={`${BASE}/cw-contests.ics`}>{`${BASE || ""}/cw-contests.ics`}</a>{" "}
            — in Google Calendar choose <em>Other calendars → From URL</em> and paste
            the full <span className="mono">https://…/cw-contests.ics</span> address.
            Google re-reads it periodically, so refreshed data flows through on its
            own.
          </dd>
        </dl>
        <p style={{ marginBottom: 0, color: "var(--muted)", fontSize: 13.5 }}>
          Both files are plain static assets — nothing here needs a running
          backend, which is what lets the whole thing live on GitHub Pages.
        </p>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <h4>A word on exchanges</h4>
        <p style={{ margin: 0 }}>
          The &ldquo;you send&rdquo; lines fill in from your station profile (any callsign,
          anywhere). Where a rule differs for DX vs. home stations, the app takes
          the view from your side. They&apos;re a memory aid, not gospel — confirm the
          exact exchange on each contest&apos;s rules page before it counts.
        </p>
      </div>

      <Link className="back-link" href="/">
        ← back to the radar
      </Link>
    </section>
  );
}
