"use client";

import { useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L, { divIcon } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { useTheme } from "next-themes";
import type { Place } from "@/lib/types";
import MarkerPopup from "./MarkerPopup";

// ─── Tile URLs ────────────────────────────────────────────────
const TILES = {
  light: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
};

// ─── Marker SVG ───────────────────────────────────────────────
function PinSvg({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="10" fill={color} />
      <circle cx="16" cy="16" r="6" fill="white" fillOpacity="0.3" />
      <circle cx="16" cy="16" r="3" fill="white" />
    </svg>
  );
}

function createMarkerIcon(color: string) {
  return divIcon({
    html: renderToStaticMarkup(<PinSvg color={color} />),
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

// ─── TileLayer switcher ───────────────────────────────────────
function DynamicTileLayer({ isDark }: { isDark: boolean }) {
  const map = useMap();
  const tileRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (tileRef.current) {
      map.removeLayer(tileRef.current);
    }
    const tile = isDark ? TILES.dark : TILES.light;
    const layer = L.tileLayer(tile.url, { attribution: tile.attribution });
    layer.addTo(map);
    tileRef.current = layer;
  }, [isDark, map]);

  return null;
}

// ─── Fit bounds on filter change ─────────────────────────────
function FitBoundsController({ places }: { places: Place[] }) {
  const map = useMap();
  const isFirst = useRef(true);

  useEffect(() => {
    if (places.length === 0) return;

    const bounds = L.latLngBounds(places.map((p) => p.coordinates));

    if (isFirst.current) {
      // Initial load: instant fit, no animation
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 10, animate: false });
      isFirst.current = false;
    } else {
      // Filter change: smooth fly
      map.flyToBounds(bounds, { padding: [64, 64], maxZoom: 10, duration: 0.8 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  return null;
}

// ─── Group polylines ──────────────────────────────────────────
function GroupPolylines({ places }: { places: Place[] }) {
  const groupMap = new Map<string, Place[]>();
  for (const p of places) {
    if (p.groupId) {
      const arr = groupMap.get(p.groupId) ?? [];
      arr.push(p);
      groupMap.set(p.groupId, arr);
    }
  }

  return (
    <>
      {Array.from(groupMap.values()).map((group) =>
        group.length > 1 ? (
          <Polyline
            key={group[0].groupId}
            positions={group.map((p) => p.coordinates)}
            pathOptions={{
              color: "var(--color-polyline)",
              weight: 2,
              opacity: 0.7,
              dashArray: "6 4",
            }}
          />
        ) : null
      )}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────
interface MapViewProps {
  places: Place[];
}

export default function MapView({ places }: MapViewProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Compute center based on places or default to Vietnam
  const center: [number, number] =
    places.length > 0
      ? [
          places.reduce((s, p) => s + p.coordinates[0], 0) / places.length,
          places.reduce((s, p) => s + p.coordinates[1], 0) / places.length,
        ]
      : [14.0583, 108.2772];

  const MARKER_COLOR_DEFAULT = isDark ? "#e0673a" : "#b5451b";
  const MARKER_COLOR_GROUP = isDark ? "#60a5fa" : "#2563eb";

  return (
    <div className="rethink-map">
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <DynamicTileLayer isDark={isDark} />
        <FitBoundsController places={places} />
        <GroupPolylines places={places} />

        {places.map((place) => (
          <Marker
            key={place.id}
            position={place.coordinates}
            icon={createMarkerIcon(
              place.groupId ? MARKER_COLOR_GROUP : MARKER_COLOR_DEFAULT
            )}
          >
            <Popup>
              <MarkerPopup place={place} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
