import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CONTESTS, contestById } from "@/lib/contests";
import { bandByKey } from "@/lib/bands";
import { ExchangeCard } from "@/components/ExchangeCard";
import { Morse } from "@/components/Morse";

export function generateStaticParams() {
  return CONTESTS.map((c) => ({ id: c.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const c = contestById(params.id);
  if (!c) return { title: "Contest · CW Contest Radar" };
  return {
    title: `${c.short} — ${c.name} · CW Contest Radar`,
    description: `${c.name}: exchange, schedule and rules. ${c.exchange.note}`,
  };
}

function scheduleText(c: NonNullable<ReturnType<typeof contestById>>): string {
  const rs = Array.isArray(c.recurrence) ? c.recurrence : [c.recurrence];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const nth = (nn: number | "last") =>
    nn === "last" ? "last" : ["1st", "2nd", "3rd", "4th", "5th"][nn - 1] ?? `${nn}th`;
  const parts: string[] = [];
  for (const r of rs) {
    if (r.kind === "weekly") {
      const s = r.sessions
        .map((x) => `${x.days.map((d) => days[d]).join("/")} ${x.start.slice(0, 2)}${x.start.slice(2)}Z`)
        .join(", ");
      parts.push(`Weekly — ${s}`);
    } else if (r.kind === "annual") {
      const wk = r.rule === "fullWeekend" ? "full weekend" : "Saturday";
      parts.push(`Annual — ${nth(r.n)} ${wk} of ${mon[r.month]}`);
    } else {
      parts.push("Announced dates each year");
    }
  }
  return parts.join(" · ");
}

function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function ContestDetail({ params }: { params: { id: string } }) {
  const c = contestById(params.id);
  if (!c) notFound();

  return (
    <>
      <section className="wrap detail-head">
        <div>
          <div className="detail-id">{c.short}</div>
          <div style={{ marginTop: 8 }}>
            <Morse text={c.short} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="detail-name">{c.name}</div>
          <div style={{ marginTop: 10 }}>
            <span className="card-tier">{c.tier}</span>{" "}
            <span className="mono" style={{ color: "var(--muted)", fontSize: 12.5, marginLeft: 8 }}>
              calls &ldquo;{c.cq}&rdquo;
            </span>
          </div>
          <div className="detail-actions">
            <a className="btn primary" href={c.rules} target="_blank" rel="noreferrer">
              Contest website / rules ↗
            </a>
            <a className="btn" href={c.logs.url} target="_blank" rel="noreferrer">
              Submit log ↗
            </a>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className="detail-grid">
          <div>
            <ExchangeCard contest={c} />
          </div>

          <div className="panel">
            <h4>At a glance</h4>
            <dl className="kv">
              <dt>CQ call</dt>
              <dd className="mono">{c.cq}</dd>
              <dt>Aliases</dt>
              <dd className="mono">{c.aliases.join(" · ")}</dd>
              <dt>Schedule</dt>
              <dd>{scheduleText(c)}</dd>
              <dt>Bands</dt>
              <dd className="mono">
                {c.bands.map((b) => bandByKey(b)?.label ?? b + "m").join(" · ")}
              </dd>
              <dt>Mode</dt>
              <dd>CW</dd>
              <dt>Exchange</dt>
              <dd>{c.exchange.note}</dd>
              <dt>Website</dt>
              <dd>
                <a href={c.rules} target="_blank" rel="noreferrer">
                  {hostLabel(c.rules)} ↗
                </a>
              </dd>
              <dt>Log</dt>
              <dd>
                <a href={c.logs.url} target="_blank" rel="noreferrer">
                  {hostLabel(c.logs.url)} ↗
                </a>
                {c.logs.deadline ? (
                  <span style={{ color: "var(--muted)" }}> · {c.logs.deadline}</span>
                ) : null}
              </dd>
            </dl>
            {c.tip ? (
              <p style={{ marginTop: 14, color: "var(--ink)", fontSize: 13.5 }}>
                <span
                  className="mono"
                  style={{ color: "var(--signal)", fontSize: 11, letterSpacing: "0.14em" }}
                >
                  TIP&nbsp;&nbsp;
                </span>
                {c.tip}
              </p>
            ) : null}
            <p style={{ marginTop: 12, color: "var(--faint)", fontSize: 12 }}>
              Always confirm the exact exchange on the rules page before a serious
              effort — organizers tweak them from year to year.
            </p>
          </div>
        </div>

        <Link className="back-link" href="/contests/">
          ← all contests
        </Link>
      </section>
    </>
  );
}
