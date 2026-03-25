"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAllPlaces } from "@/lib/places";

function normalize(s: string) {
  return s.normalize("NFD").replaceAll(/\p{Diacritic}/gu, "").toLowerCase();
}

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const appliedSearch = params.get("search") ?? "";

  const [inputValue, setInputValue] = useState(appliedSearch);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync local input if URL param is cleared externally
  useEffect(() => {
    setInputValue(appliedSearch);
  }, [appliedSearch]);

  const suggestions = useMemo(() => {
    const q = inputValue.trim();
    if (!q) return [];
    const norm = normalize(q);
    return getAllPlaces()
      .filter(
        (p) =>
          normalize(p.name).includes(norm) ||
          normalize(p.province).includes(norm) ||
          normalize(p.country).includes(norm)
      )
      .slice(0, 7);
  }, [inputValue]);

  const applySearch = useCallback(
    (value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) {
        next.set("search", value);
      } else {
        next.delete("search");
      }
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
      setOpen(false);
    },
    [params, pathname, router]
  );

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const showDropdown = open && suggestions.length > 0;

  return (
    <div className="rethink-search" ref={containerRef}>
      <svg
        className="rethink-search__icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        className={`rethink-search__input${showDropdown ? " rethink-search__input--open" : ""}`}
        placeholder="Tìm địa điểm..."
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        aria-label="Tìm kiếm địa điểm"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        autoComplete="off"
      />

      {(inputValue || appliedSearch) && (
        <button
          className="rethink-search__clear"
          onClick={() => {
            setInputValue("");
            applySearch("");
          }}
          aria-label="Xóa tìm kiếm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            width="14"
            height="14"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {showDropdown && (
        <ul className="rethink-search__suggestions" role="listbox">
          {suggestions.map((place) => (
            <li key={place.id} role="option">
              <button
                className="rethink-search__suggestion"
                onMouseDown={(e) => {
                  // mousedown fires before input blur, prevent input losing focus issues
                  e.preventDefault();
                  setInputValue(place.name);
                  applySearch(place.name);
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="rethink-search__suggestion-name">{place.name}</span>
                <span className="rethink-search__suggestion-meta">
                  {place.province}{place.country !== "Vietnam" ? `, ${place.country}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
