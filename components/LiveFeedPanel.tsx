"use client";
import type { LiveFeed } from "@/lib/types";
import { relative } from "@/lib/format";

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
        No live feed committed yet. The schedule above still works fully — it runs
        off the built-in database. Once the <b>refresh</b> workflow runs in CI,
        this week&apos;s events from WA7BNM appear here.
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
      {feed.items.map((c, i) => (
        <div className="feed-row" key={i}>
          <div>
            <div className="fn">{c.name}</div>
            <div className="fx">
              {c.exchange ? `exch: ${c.exchange}` : c.mode}
              {c.bands ? ` · ${c.bands}` : ""}
            </div>
          </div>
          <div className="ft">{c.time}</div>
        </div>
      ))}
    </div>
  );
}
