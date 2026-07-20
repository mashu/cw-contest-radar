"use client";
import type { LiveFeed } from "@/lib/types";
import { relative } from "@/lib/format";
import { CONTESTS } from "@/lib/contests";
import { namesMatch } from "@/lib/feedSchedule";

function isCurated(name: string): boolean {
  return CONTESTS.some((c) => namesMatch(name, c.name, c.short, c.aliases));
}

export function LiveFeedPanel({
  feed,
  loaded,
}: {
  feed: LiveFeed | null;
  loaded: boolean;
}) {
  if (!loaded) {
    return <div className="feed-status">checking the live feed…</div>;
  }
  if (!feed) {
    return (
      <div className="empty">
        No live feed committed yet. Built-in contests still work offline. Once the{" "}
        <b>refresh</b> workflow runs, every CW event from WA7BNM appears here and
        in the radar above.
      </div>
    );
  }
  if (feed.items.length === 0) {
    return (
      <div className="feed-status">
        No CW contests in the current live window. Feed updated{" "}
        {relative(new Date(feed.generatedAt), new Date())}.
      </div>
    );
  }
  return (
    <div className="feed-list">
      <div className="feed-status" style={{ marginBottom: 10 }}>
        {feed.items.length} CW events · updated{" "}
        {relative(new Date(feed.generatedAt), new Date())} · nothing dropped
      </div>
      {feed.items.map((c, i) => {
        const known = isCurated(c.name);
        return (
          <div className="feed-row" key={`${c.name}-${c.time}-${i}`}>
            <div>
              <div className="fn">
                {c.name}{" "}
                <span
                  className="card-tier"
                  style={{ marginLeft: 6, verticalAlign: "middle" }}
                >
                  {known ? "curated" : "calendar"}
                </span>
              </div>
              <div className="fx">
                {c.exchange ? `exch: ${c.exchange}` : "exchange not listed"}
                {c.bands ? ` · ${c.bands}` : ""}
                {c.rules ? (
                  <>
                    {" · "}
                    <a href={c.rules} target="_blank" rel="noreferrer" className="inline-link">
                      rules ↗
                    </a>
                  </>
                ) : null}
              </div>
            </div>
            <div className="ft">{c.time}</div>
          </div>
        );
      })}
    </div>
  );
}
