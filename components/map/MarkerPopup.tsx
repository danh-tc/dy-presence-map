"use client";

import Image from "next/image";
import Link from "next/link";
import type { Place } from "@/lib/types";

interface MarkerPopupProps {
  place: Place;
}

export default function MarkerPopup({ place }: MarkerPopupProps) {
  const MAX_THUMBS = 3;
  const thumbs = place.featuredImages.slice(0, MAX_THUMBS);
  const extra = place.featuredImages.length - MAX_THUMBS;

  const formattedDate = new Date(place.date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="rethink-map__popup">
      {place.coverImage && (
        <div className="rethink-map__popup-cover">
          <Image
            src={place.coverImage}
            alt={place.name}
            fill
            style={{ objectFit: "cover" }}
            sizes="280px"
          />
        </div>
      )}

      <div className="rethink-map__popup-body">
        {place.groupId && (
          <span className="rethink-map__popup-group-badge">
            {place.groupLabel}
          </span>
        )}

        <h3 className="rethink-map__popup-name">{place.name}</h3>

        <p className="rethink-map__popup-meta">
          <span>{place.province}</span>
          {place.city && <span>· {place.city}</span>}
          <span>· {formattedDate}</span>
        </p>

        <p className="rethink-map__popup-summary">{place.summary}</p>

        {thumbs.length > 0 && (
          <div className="rethink-map__popup-thumbnails">
            {thumbs.map((src, i) => (
              <Image
                key={i}
                src={src}
                alt={`${place.name} ${i + 1}`}
                width={56}
                height={56}
                style={{ objectFit: "cover" }}
              />
            ))}
            {extra > 0 && (
              <div className="rethink-map__popup-thumbnails-more">
                +{extra}
              </div>
            )}
          </div>
        )}

        <Link
          href={`/place/${place.slug}`}
          className="rethink-map__popup-link"
        >
          Xem chi tiết →
        </Link>
      </div>
    </div>
  );
}
