const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function pad2(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

export function hhmmZ(d: Date): string {
  return `${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}Z`;
}

export function clockZ(d: Date): string {
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(
    d.getUTCSeconds()
  )}Z`;
}

export function dateLabel(d: Date): string {
  return `${DOW[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`;
}

export function dayKey(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(
    d.getUTCDate()
  )}`;
}

export function dateInputValue(d: Date): string {
  return dayKey(d);
}

// Parse a yyyy-mm-dd date input as a UTC midnight instant.
export function parseDateInput(s: string): Date {
  const [y, m, d] = s.split("-").map((x) => parseInt(x, 10));
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}

export function durationLabel(ms: number): string {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// "in 2 h 10 min" / "3 days" / "live now" style relative label.
export function relative(target: Date, now: Date): string {
  const ms = target.getTime() - now.getTime();
  const abs = Math.abs(ms);
  const mins = Math.round(abs / 60000);
  let text: string;
  if (mins < 60) text = `${mins} min`;
  else if (mins < 60 * 24) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    text = m ? `${h} h ${m} min` : `${h} h`;
  } else {
    const days = Math.round(mins / (60 * 24));
    text = `${days} day${days === 1 ? "" : "s"}`;
  }
  return ms >= 0 ? `in ${text}` : `${text} ago`;
}
