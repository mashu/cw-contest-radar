"use client";
import { useEffect, useState } from "react";
import { loadLiveFeed } from "@/lib/feed";
import { relative } from "@/lib/format";

export function FeedFreshness() {
  const [text, setText] = useState<string>("curated schedule · offline-ready");
  useEffect(() => {
    let live = true;
    loadLiveFeed().then((feed) => {
      if (!live) return;
      if (feed?.generatedAt) {
        const d = new Date(feed.generatedAt);
        setText(`live feed updated ${relative(d, new Date())} · ${feed.items.length} CW events`);
      }
    });
    return () => {
      live = false;
    };
  }, []);
  return <span suppressHydrationWarning>{text}</span>;
}
