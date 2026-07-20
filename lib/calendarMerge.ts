import { CONTESTS } from "./contests";
import {
  fallbackWindow,
  guessExchangeTemplate,
  namesMatch,
  parseBandsList,
  shortFromName,
  slugId,
  windowsForFeedItem,
} from "./feedSchedule";
import type { Contest, Instance, LiveContest, LiveFeed } from "./types";

export type CalendarMerge = {
  /** Curated DB + one synthetic entry per unmatched calendar contest. */
  contests: Contest[];
  /** Concrete windows from the live calendar (matched → curated id, else synthetic). */
  instances: Instance[];
  /** How many feed rows were folded in. */
  feedItems: number;
  /** Rows that had no curated twin. */
  calendarOnly: number;
  /** Rows whose times we could not parse (still shown via fallback window). */
  fuzzyTimes: number;
};

function findCurated(item: LiveContest): Contest | undefined {
  return CONTESTS.find((c) => namesMatch(item.name, c.name, c.short, c.aliases));
}

function synthContest(item: LiveContest, windows: { start: Date; end: Date }[]): Contest {
  const bands = parseBandsList(item.bands);
  const exch = (item.exchange || "").trim();
  const template = guessExchangeTemplate(exch);
  return {
    id: slugId(item.name),
    name: item.name,
    short: shortFromName(item.name),
    cq: `CQ ${shortFromName(item.name)}`,
    aliases: [item.name, shortFromName(item.name)],
    bands: bands.length ? bands : ["160", "80", "40", "20", "15", "10"],
    exchange: {
      youSend: template,
      note: exch
        ? `Calendar: ${exch}`
        : "No exchange listed in the calendar — check the rules link before you call.",
      rst: /rst/i.test(exch),
    },
    logs: {
      url: item.log || item.rules || "https://www.contestcalendar.com/",
      ...(item.deadline ? { deadline: item.deadline } : {}),
    },
    rules: item.rules || item.log || "https://www.contestcalendar.com/",
    tip: "Listed on the WA7BNM calendar this week. Details may be incomplete — confirm on the organizer’s page.",
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
 * Fold every CW row from the live WA7BNM feed into the radar.
 * - Matched names attach calendar windows to the curated contest id.
 * - Unmatched names become synthetic contests (still shown with best-effort info).
 * - Unparseable times get a week-long fallback window so nothing is dropped.
 */
export function mergeCalendarFeed(feed: LiveFeed | null): CalendarMerge {
  if (!feed?.items.length) {
    return {
      contests: [...CONTESTS],
      instances: [],
      feedItems: 0,
      calendarOnly: 0,
      fuzzyTimes: 0,
    };
  }

  const year = new Date(feed.generatedAt).getUTCFullYear() || new Date().getUTCFullYear();
  const synthById = new Map<string, Contest>();
  const instances: Instance[] = [];
  let calendarOnly = 0;
  let fuzzyTimes = 0;

  for (const item of feed.items) {
    const curated = findCurated(item);
    let windows = windowsForFeedItem(item, year);
    if (!windows.length) {
      windows = [fallbackWindow(feed.generatedAt)];
      fuzzyTimes++;
    }

    const bands = parseBandsList(item.bands);
    const bandList = bands.length ? bands : curated?.bands ?? ["80", "40", "20"];

    if (curated) {
      for (const w of windows) {
        instances.push({
          contestId: curated.id,
          start: w.start,
          end: w.end,
          bands: bandList,
        });
      }
      continue;
    }

    calendarOnly++;
    const id = slugId(item.name);
    if (!synthById.has(id)) {
      synthById.set(id, synthContest(item, windows));
    } else {
      // Merge additional windows into the existing synth recurrence
      const existing = synthById.get(id)!;
      const rs = existing.recurrence;
      if (!Array.isArray(rs) && rs.kind === "manual") {
        const more = windows.map((w) => ({
          start: w.start.toISOString(),
          end: w.end.toISOString(),
          ...(bands.length ? { bands } : {}),
        }));
        synthById.set(id, {
          ...existing,
          recurrence: { kind: "manual", windows: [...rs.windows, ...more] },
        });
      }
    }
    for (const w of windows) {
      instances.push({
        contestId: id,
        start: w.start,
        end: w.end,
        bands: bandList,
      });
    }
  }

  return {
    contests: [...CONTESTS, ...synthById.values()],
    instances,
    feedItems: feed.items.length,
    calendarOnly,
    fuzzyTimes,
  };
}

/** @deprecated use mergeCalendarFeed */
export function calendarExtras(feed: LiveFeed | null) {
  const m = mergeCalendarFeed(feed);
  return {
    contests: m.contests.filter((c) => c.id.startsWith("cal-")),
    instances: m.instances.filter((i) => i.contestId.startsWith("cal-")),
  };
}

export function allContestsWithExtras(extras: Contest[]): Contest[] {
  if (!extras.length) return CONTESTS;
  const ids = new Set(CONTESTS.map((c) => c.id));
  return [...CONTESTS, ...extras.filter((c) => !ids.has(c.id))];
}
