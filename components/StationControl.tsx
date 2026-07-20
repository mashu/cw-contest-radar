"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  DEFAULT_STATION,
  isDefaultStation,
  loadStation,
  saveStation,
} from "@/lib/station";
import type { Station } from "@/lib/types";

export const STATION_EVENT = "cw-radar-station-change";

const FIELDS: { key: keyof Station; label: string; hint?: string; wide?: boolean }[] = [
  { key: "call", label: "Callsign", wide: true },
  { key: "name", label: "Name (first)" },
  { key: "power", label: "Power (W)" },
  { key: "cqZone", label: "CQ zone" },
  { key: "ituZone", label: "ITU zone" },
  { key: "grid", label: "Grid (4-char)" },
  { key: "age", label: "Age" },
  {
    key: "province",
    label: "Province / SPC",
    hint: "State, province letter, or SPC — used by SP DX, NAQP-style contests",
  },
  {
    key: "country",
    label: "Country tag",
    hint: "Short country / entity tag for SPC-style exchanges (e.g. POL, USA, JA)",
  },
];

export function StationControl() {
  const [station, setStation] = useState<Station>(DEFAULT_STATION);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Station>(DEFAULT_STATION);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStation(loadStation());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (open) setDraft(station);
  }, [open, station]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function commit() {
    const next: Station = {
      call: draft.call.trim().toUpperCase() || DEFAULT_STATION.call,
      name: draft.name.trim() || DEFAULT_STATION.name,
      cqZone: draft.cqZone.trim(),
      ituZone: draft.ituZone.trim(),
      age: draft.age.trim(),
      grid: draft.grid.trim().toUpperCase(),
      province: draft.province.trim().toUpperCase(),
      country: draft.country.trim().toUpperCase(),
      power: draft.power.trim(),
    };
    saveStation(next);
    setStation(next);
    window.dispatchEvent(new CustomEvent(STATION_EVENT, { detail: next }));
    setOpen(false);
  }

  function reset() {
    setDraft({ ...DEFAULT_STATION });
  }

  const usingDefaults = hydrated && isDefaultStation(station);

  const drawer =
    open && hydrated
      ? createPortal(
          <div className="overlay" onMouseDown={() => setOpen(false)} role="presentation">
            <aside
              className="drawer"
              onMouseDown={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="station-title"
            >
              <div className="drawer-head">
                <h3 id="station-title">Your station</h3>
                <button
                  type="button"
                  className="btn copy-mini"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <p className="sub">
                Every &ldquo;you send&rdquo; line fills in from these fields. Stored only in
                this browser — works for any callsign worldwide. Defaults are a
                sample Polish station ({DEFAULT_STATION.call}).
              </p>
              <div className="field-grid">
                {FIELDS.map((f) => (
                  <div
                    className="field"
                    key={f.key}
                    style={f.wide ? { gridColumn: "1 / -1" } : undefined}
                  >
                    <label htmlFor={`st-${f.key}`}>{f.label}</label>
                    <input
                      id={`st-${f.key}`}
                      value={draft[f.key]}
                      autoComplete="off"
                      spellCheck={false}
                      onChange={(e) =>
                        setDraft({ ...draft, [f.key]: e.target.value })
                      }
                    />
                    {f.hint ? <div className="field-hint">{f.hint}</div> : null}
                  </div>
                ))}
              </div>
              <div className="drawer-foot">
                <button type="button" className="btn primary" onClick={commit}>
                  Save profile
                </button>
                <button type="button" className="btn" onClick={reset}>
                  Reset to sample
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ marginLeft: "auto" }}
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
            </aside>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        className={`station-chip ${usingDefaults ? "is-hint" : ""}`}
        onClick={() => setOpen(true)}
        title="Edit your station — exchanges fill in from this"
      >
        <b>{station.call}</b>
        <span className="station-chip-meta">
          {usingDefaults ? " · set your call" : " · profile"}
        </span>
      </button>
      {drawer}
    </>
  );
}
