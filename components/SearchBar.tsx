"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const search = params.get("search") ?? "";

  const update = useCallback(
    (value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) {
        next.set("search", value);
      } else {
        next.delete("search");
      }
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router]
  );

  return (
    <div className="rethink-search">
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
        type="search"
        className="rethink-search__input"
        placeholder="Tìm địa điểm..."
        value={search}
        onChange={(e) => update(e.target.value)}
        aria-label="Tìm kiếm địa điểm"
      />

      {search && (
        <button
          className="rethink-search__clear"
          onClick={() => update("")}
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
    </div>
  );
}
