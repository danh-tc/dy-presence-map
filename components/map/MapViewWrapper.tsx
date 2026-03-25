"use client";

import dynamic from "next/dynamic";
import type { Place } from "@/lib/types";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-secondary)",
        color: "var(--color-text-muted)",
        fontSize: "0.875rem",
      }}
    >
      Đang tải bản đồ...
    </div>
  ),
});

export default function MapViewWrapper({ places }: { places: Place[] }) {
  return <MapView places={places} />;
}
