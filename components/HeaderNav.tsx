"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Radar" },
  { href: "/contests/", label: "Contests" },
  { href: "/about/", label: "About" },
] as const;

export function HeaderNav() {
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav className="header-nav" aria-label="Primary">
      <div className="header-nav-links">
        {LINKS.map((l) => {
          const active =
            l.href === "/" ? path === "/" : path.startsWith(l.href.replace(/\/$/, ""));
          return (
            <Link key={l.href} href={l.href} className={active ? "active" : ""}>
              {l.label}
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        className={`nav-burger ${open ? "on" : ""}`}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      {open && (
        <div id="mobile-nav" className="mobile-nav" role="menu">
          {LINKS.map((l) => {
            const active =
              l.href === "/" ? path === "/" : path.startsWith(l.href.replace(/\/$/, ""));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={active ? "active" : ""}
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
