import { CONTESTS } from "./contests";
import { mergeCalendarFeed } from "./calendarMerge";
import { namesMatch, slugId } from "./feedSchedule";
import type { LiveContest, LiveFeed } from "./types";

export type FeedCoverage = {
  readonly parsedAll: number;
  readonly cwKept: number;
  readonly nonCwSkipped: number;
  readonly mergedInstances: number;
  readonly calendarOnly: number;
  readonly fuzzyTimes: number;
  /** CW feed rows that did not produce any radar instance. */
  readonly missingNames: readonly string[];
  readonly ok: boolean;
};

function contestIdFor(item: LiveContest): string {
  const curated = CONTESTS.find((c) =>
    namesMatch(item.name, c.name, c.short, c.aliases)
  );
  return curated?.id ?? slugId(item.name);
}

/**
 * Double-check that every CW row from the weekly calendar becomes a visible
 * radar instance (curated match or synthetic cal-*). Incomplete times still
 * count — they use the week-long fallback window.
 */
export function auditFeedCoverage(
  allParsed: readonly LiveContest[],
  feed: LiveFeed
): FeedCoverage {
  const merge = mergeCalendarFeed(feed);
  const missingNames: string[] = [];
  for (const item of feed.items) {
    const id = contestIdFor(item);
    if (!merge.instances.some((i) => i.contestId === id)) {
      missingNames.push(item.name);
    }
  }
  return {
    parsedAll: allParsed.length,
    cwKept: feed.items.length,
    nonCwSkipped: allParsed.length - feed.items.length,
    mergedInstances: merge.instances.length,
    calendarOnly: merge.calendarOnly,
    fuzzyTimes: merge.fuzzyTimes,
    missingNames,
    ok: missingNames.length === 0 && (allParsed.length > 0 || feed.items.length === 0),
  };
}

export function formatFeedCoverage(c: FeedCoverage): string {
  const lines = [
    `coverage: ${c.cwKept}/${c.parsedAll} CW kept · ${c.nonCwSkipped} non-CW skipped`,
    `merge: ${c.mergedInstances} instances · ${c.calendarOnly} calendar-only · ${c.fuzzyTimes} fuzzy times`,
  ];
  if (c.missingNames.length) {
    lines.push(`MISSING (${c.missingNames.length}): ${c.missingNames.join("; ")}`);
  } else {
    lines.push("ok: every CW event has a radar instance");
  }
  return lines.join("\n");
}
