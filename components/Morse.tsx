const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.",
  H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.",
  O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-",
  V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
};

// Renders a short string (a contest identifier) as dit/dah marks — the site's
// visual signature, echoing the sound of the mode itself.
export function Morse({ text, className }: { text: string; className?: string }) {
  const letters = text.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6).split("");
  return (
    <span className={`morse ${className ?? ""}`} aria-hidden="true">
      {letters.map((ch, li) => (
        <span className="morse-letter" key={li}>
          {(MORSE[ch] ?? "").split("").map((sym, si) => (
            <span
              key={si}
              className={sym === "-" ? "morse-dah" : "morse-dit"}
            />
          ))}
        </span>
      ))}
    </span>
  );
}
