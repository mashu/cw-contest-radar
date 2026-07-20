"use client";

type Props = {
  heard: string;
  freq: string;
  dateStr: string;
  bandLabel: string | null;
  bandWarn: boolean;
  heardHint: string | null;
  onHeard: (v: string) => void;
  onFreq: (v: string) => void;
  onDate: (v: string) => void;
  onToday: () => void;
};

const BAND_SPOTS: { label: string; freq: string }[] = [
  { label: "80m", freq: "3530" },
  { label: "40m", freq: "7030" },
  { label: "20m", freq: "14030" },
  { label: "15m", freq: "21030" },
];

export function TuningBar(p: Props) {
  return (
    <>
      <div className="tuner">
        <div className="tuner-cell">
          <label htmlFor="heard">Copied off the air</label>
          <input
            id="heard"
            value={p.heard}
            placeholder="e.g. CQ MWC, TEST, WPX…"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => p.onHeard(e.target.value)}
          />
          <div className={`tuner-readout ${p.heard && !p.heardHint ? "warn" : ""}`}>
            {p.heard
              ? p.heardHint ?? "no contest matches that yet"
              : "type what you hear a station calling"}
          </div>
        </div>

        <div className="tuner-cell">
          <label htmlFor="freq">Frequency</label>
          <input
            id="freq"
            value={p.freq}
            placeholder="14028"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => p.onFreq(e.target.value)}
          />
          <div className={`tuner-readout ${p.bandWarn ? "warn" : ""}`}>
            {p.freq
              ? p.bandWarn
                ? "outside the ham bands"
                : p.bandLabel ?? "—"
              : "kHz or MHz — filters by band"}
          </div>
        </div>

        <div className="tuner-cell">
          <label htmlFor="date">Date (UTC)</label>
          <input
            id="date"
            type="date"
            value={p.dateStr}
            onChange={(e) => p.onDate(e.target.value)}
          />
          <div className="tuner-readout">defaults to today</div>
        </div>
      </div>

      <div className="quicktags">
        <span className="lbl">Jump to</span>
        <button type="button" className="chip" onClick={p.onToday}>
          ● now
        </button>
        {BAND_SPOTS.map((b) => (
          <button type="button" key={b.label} className="chip" onClick={() => p.onFreq(b.freq)}>
            {b.label} CW
          </button>
        ))}
        {(p.heard || p.freq) && (
          <button
            type="button"
            className="chip"
            onClick={() => {
              p.onHeard("");
              p.onFreq("");
            }}
          >
            clear filters ✕
          </button>
        )}
      </div>
    </>
  );
}
