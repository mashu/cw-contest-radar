"use client";
import { useState } from "react";

export function CopyButton({
  text,
  label = "Copy",
  className = "btn",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.setTimeout(() => setDone(false), 1600);
    } catch {
      /* clipboard may be unavailable — non-fatal */
    }
  }

  return (
    <button type="button" className={className} onClick={copy} title={`Copy “${text}”`}>
      {done ? "Copied ✓" : label}
    </button>
  );
}
