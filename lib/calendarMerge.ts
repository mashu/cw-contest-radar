import { CONTESTS } from "./contests";
import {
  guessExchangeTemplate,
  namesMatch,
  parseBandsList,
  shortFromName,
  slugId,
  windowsForFeedItem,
} from "./feedSchedule";
import type { Contest, Instance, LiveContest, LiveFeed } from "./types";

export type CalendarExtra = {
  contests: Contest[];
  instances: Instance[];
};

function findCurated(item: LiveContest): Contest | undefined {
  return CONTESTS.find((c) => namesMatch(item.name, c.name, c.short, c.aliases));
}

function synthContest(item: LiveContest, windows: { start: Date; end: Date }[]): Contest {
  const bands = parseBandsList(item.bands);
  return {
    id: slugId(item.name),
    name: item.name,
    short: shortFromName(item.name),
    cq: `CQ ${shortFromName(item.name)}`,
    aliases: [item.name, shortFromName(item.name)],
    bands: bands.length ? bands : ["80", "40", "20"],
    exchange: {
      youSend: guessExchangeTemplate(item.exchange),
      note:
        item.exchange ||
        "Exchange taken from the WA7BNM calendar — confirm on the rules page.",
      rst: /rst/i.test(item.exchange || ""),
    },
    logs: {
      url: item.log || item.rules || "https://www.contestcalendar.com/",
      ...(item.deadline ? { deadline: item.deadline } : {}),
    },
    rules: item.rules || item.log || "https://www.contestcalendar.com/",
    tip: "From the live WA7BNM calendar (not yet in the built-in recurrence DB).",
    tier: "regional",
    recurrence: {
      kind: "manual",
      windows: windows.map((w) => ({
        start: w.start.toISOString(),
        end: w.end.toISOString(),
        ...(bands.length ? { bands } : {}),
      })),
    },
  };
}

/**
 * Contests present in the live feed but missing from the curated database,
 * expanded into concrete instances for the current calendar week.
 */
export function calendarExtras(feed: LiveFeed | null): CalendarExtra {
  if (!feed?.items.length) return { contests: [], instances: [] };

  const year = new Date(feed.generatedAt).getUTCFullYear() || new Date().getUTCFullYear();
  const contests: Contest[] = [];
  const instances: Instance[] = [];
  const seen = new Set<string>();

  for (const item of feed.items) {
    if (findCurated(item)) continue;
    const windows = windowsForFeedItem(item, year);
    if (!windows.length) continue;
    const id = slugId(item.name);
    if (!seen.has(id)) {
      seen.add(id);
      contests.push(synthContest(item, windows));
    }
    const bands = parseBandsList(item.bands);
    for (const w of windows) {
      instances.push({
        contestId: id,
        start: w.start,
        end: w.end,
        bands: bands.length ? bands : ["80", "40", "20"],
      });
    }
  }

  return { contests, instances };
}

export function allContestsWithExtras(extras: Contest[]): Contest[] {
  if (!extras.length) return CONTESTS;
  return [...CONTESTS, ...extras];
}
