"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const LeafletPicker = dynamic(() => import("./LeafletPicker"), {
  ssr: false,
  loading: () => (
    <div className="rethink-coord-picker__map" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Đang tải bản đồ...</span>
    </div>
  ),
});

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

export function CoordinatePicker({ lat, lng, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&accept-language=vi,en`,
          { headers: { "User-Agent": "dy-presence-map/1.0" } }
        );
        const data: NominatimResult[] = await res.json();
        setResults(data);
        setShowResults(true);
      } catch {
        // ignore network errors
      } finally {
        setLoading(false);
      }
    }, 450);
  }, [query]);

  function selectResult(result: NominatimResult) {
    const selectedLat = parseFloat(result.lat);
    const selectedLng = parseFloat(result.lon);
    onChange(selectedLat, selectedLng);
    setQuery(result.display_name.split(",")[0].trim());
    setShowResults(false);
  }

  return (
    <div className="rethink-coord-picker">
      <div className="rethink-coord-picker__search" ref={searchRef}>
        <input
          type="text"
          placeholder="Tìm kiếm địa điểm (vd: Đà Lạt, Lâm Đồng)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          autoComplete="off"
        />
        <div className="rethink-coord-picker__search-icon">
          {loading ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="rethink-spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
        </div>

        {showResults && results.length > 0 && (
          <div className="rethink-coord-picker__results">
            {results.map((r) => (
              <button
                key={r.place_id}
                className="rethink-coord-picker__result-item"
                onClick={() => selectResult(r)}
                type="button"
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <LeafletPicker lat={lat} lng={lng} onChange={onChange} />

      <div className="rethink-coord-picker__coords">
        <span>Latitude:</span>
        <code>{lat != null ? lat.toFixed(6) : "—"}</code>
        <span style={{ marginLeft: "8px" }}>Longitude:</span>
        <code>{lng != null ? lng.toFixed(6) : "—"}</code>
        {lat == null && (
          <span style={{ marginLeft: "8px", fontStyle: "italic" }}>
            Click vào bản đồ hoặc tìm kiếm để chọn tọa độ
          </span>
        )}
      </div>
    </div>
  );
}
