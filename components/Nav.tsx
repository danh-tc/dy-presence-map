"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="rethink-nav">
      <Link href="/" className="rethink-nav__brand">
        <span className="rethink-nav__brand-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 10h16M10 2a14 14 0 0 1 0 16M10 2a14 14 0 0 0 0 16" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
        <div className="rethink-nav__brand-text">
          <span className="rethink-nav__brand-name">Daen’s Footprints</span>
          <span className="rethink-nav__brand-tagline">những nơi đã qua</span>
        </div>
      </Link>

      <nav className="rethink-nav__actions" aria-label="Điều hướng chính">
        <Link
          href="/"
          className={`rethink-nav__link${pathname === "/" ? " rethink-nav__link--active" : ""}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          <span>Bản đồ</span>
        </Link>
        <Link
          href="/timeline"
          className={`rethink-nav__link${pathname === "/timeline" ? " rethink-nav__link--active" : ""}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <span>Timeline</span>
        </Link>
        <div className="rethink-nav__divider" aria-hidden="true" />
        <ThemeToggle />
      </nav>
    </header>
  );
}
