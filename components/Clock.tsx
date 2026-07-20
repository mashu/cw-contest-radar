"use client";
import { useEffect, useState } from "react";
import { clockZ } from "@/lib/format";

export function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="clock" title="Current UTC time">
      <span className="dot" />
      <span suppressHydrationWarning>{now ? clockZ(now) : "--:--:--Z"}</span>
    </div>
  );
}
