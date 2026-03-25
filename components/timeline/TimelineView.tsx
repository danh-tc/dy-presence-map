import Image from "next/image";
import Link from "next/link";
import { groupByYear } from "@/lib/places";
import type { Place } from "@/lib/types";

interface TimelineViewProps {
  places: Place[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// For grouped events: show as one entry with multiple location pills
function deduplicateBySlug(places: Place[]): Place[] {
  const seen = new Set<string>();
  return places.filter((p) => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
}

function getGroupedPlaces(slug: string, allPlaces: Place[]): Place[] {
  return allPlaces.filter((p) => p.slug === slug);
}

export default function TimelineView({ places }: TimelineViewProps) {
  const deduplicated = deduplicateBySlug(places);
  const grouped = groupByYear(deduplicated);
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="rethink-timeline">
      {years.map((year) => (
        <div key={year} className="rethink-timeline__year-group">
          <h2 className="rethink-timeline__year-label">{year}</h2>
          <div className="rethink-timeline__entries">
            {grouped[year].map((place) => {
              const siblings = place.groupId
                ? getGroupedPlaces(place.slug, places)
                : [place];
              const isGroup = siblings.length > 1;

              return (
                <div
                  key={place.id}
                  className={`rethink-timeline__entry${isGroup ? " rethink-timeline__entry--group" : ""}`}
                >
                  <Link
                    href={`/place/${place.slug}`}
                    className="rethink-timeline__entry-inner"
                  >
                    <div className="rethink-timeline__entry-image">
                      {place.coverImage ? (
                        <Image
                          src={place.coverImage}
                          alt={place.name}
                          width={96}
                          height={96}
                          style={{ objectFit: "cover", width: "100%", height: "100%" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "var(--color-bg-secondary)",
                          }}
                        />
                      )}
                    </div>

                    <div className="rethink-timeline__entry-body">
                      <div className="rethink-timeline__entry-badges">
                        {isGroup && (
                          <span className="rethink-timeline__entry-badge rethink-timeline__entry-badge--group">
                            {place.groupLabel}
                          </span>
                        )}
                        <span className="rethink-timeline__entry-badge">
                          {place.country}
                        </span>
                      </div>

                      <h3 className="rethink-timeline__entry-name">
                        {isGroup ? place.groupLabel ?? place.name : place.name}
                      </h3>

                      <p className="rethink-timeline__entry-meta">
                        {formatDate(place.date)}
                      </p>

                      <p className="rethink-timeline__entry-summary">
                        {place.summary}
                      </p>

                      {isGroup && (
                        <div className="rethink-timeline__entry-locations">
                          {siblings.map((s) => (
                            <span
                              key={s.id}
                              className="rethink-timeline__entry-location-pill"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
