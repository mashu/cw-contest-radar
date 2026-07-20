import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Clock } from "@/components/Clock";
import { HeaderNav } from "@/components/HeaderNav";
import { StationControl } from "@/components/StationControl";
import { FeedFreshness } from "@/components/FeedFreshness";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "CW Contest Radar",
  description:
    "See which CW contests are on the air right now, on any date, or from a frequency you're tuned to — and exactly what to send back.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Sora:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#071018" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body>
        <div className="atmos" aria-hidden="true" />
        <header className="site-header">
          <div className="wrap header-row">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="2" y="13" width="2.4" height="6" rx="1" fill="#3ce6c8" />
                  <rect x="6" y="9" width="2.4" height="10" rx="1" fill="#3ce6c8" />
                  <rect x="10" y="3" width="2.4" height="16" rx="1" fill="#f0b35a" />
                  <rect x="14" y="7" width="2.4" height="12" rx="1" fill="#3ce6c8" />
                  <rect x="18" y="11" width="2.4" height="8" rx="1" fill="#3ce6c8" />
                </svg>
              </span>
              <span className="brand-text">
                <span className="brand-name">CW Contest Radar</span>
                <span className="brand-sub">on air · on any date</span>
              </span>
            </Link>
            <span className="header-spacer" />
            <HeaderNav />
            <Clock />
            <StationControl />
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="wrap foot-row">
            <a className="f-link" href={`${BASE}/feed.xml`}>
              RSS feed
            </a>
            <a className="f-link" href={`${BASE}/cw-contests.ics`}>
              Calendar (.ics)
            </a>
            <Link className="f-link" href="/about/">
              How it works
            </Link>
            <span className="foot-meta">
              <FeedFreshness />
              <br />
              curated schedule + WA7BNM · verify exchanges on rules pages
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
