import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getPlacesBySlug } from "@/lib/places";
import type { Place } from "@/lib/types";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const places = getPlacesBySlug(slug);
  if (!places.length) return {};
  const place = places[0];
  return {
    title: `${place.groupLabel ?? place.name} - Daen’s Footprints`,
    description: place.summary,
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function LocationIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default async function PlaceDetailPage({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const places = getPlacesBySlug(slug);

  if (!places.length) notFound();

  const primary = places[0];
  const isGroup = places.length > 1;
  const title = isGroup ? (primary.groupLabel ?? primary.name) : primary.name;
  const allImages = places.flatMap((p) => p.featuredImages);

  return (
    <article className="rethink-detail">
      <Link href="/" className="rethink-detail__back">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Quay lại bản đồ
      </Link>

      {primary.coverImage && (
        <div className="rethink-detail__hero">
          <Image
            src={primary.coverImage}
            alt={title}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 900px) 100vw, 900px"
            priority
          />
        </div>
      )}

      <div className="rethink-detail__header">
        <div className="rethink-detail__badges">
          {isGroup && (
            <span className="rethink-detail__badge rethink-detail__badge--group">
              Sự kiện
            </span>
          )}
          <span className="rethink-detail__badge">{primary.country}</span>
        </div>

        <h1 className="rethink-detail__title">{title}</h1>

        <div className="rethink-detail__meta">
          <span>
            <LocationIcon />
            {isGroup
              ? places.map((p) => p.province).join(" · ")
              : [primary.province, primary.city].filter(Boolean).join(", ")}
          </span>
          <span>
            <CalendarIcon />
            {isGroup
              ? `${formatDate(places[places.length - 1].date)} – ${formatDate(places[0].date)}`
              : formatDate(primary.date)}
          </span>
        </div>
      </div>

      {isGroup && (
        <div className="rethink-detail__locations">
          {places.map((place: Place) => (
            <div key={place.id} className="rethink-detail__location-item">
              <div className="rethink-detail__location-marker">
                <PinIcon />
              </div>
              <div className="rethink-detail__location-info">
                <p className="rethink-detail__location-name">{place.name}</p>
                <p className="rethink-detail__location-date">
                  {formatDate(place.date)} · {place.province}
                  {place.city ? `, ${place.city}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {allImages.length > 0 && (
        <div className="rethink-detail__gallery">
          {allImages.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt={`${title} ${i + 1}`}
              width={400}
              height={300}
              style={{ objectFit: "cover", width: "100%", height: "auto" }}
            />
          ))}
        </div>
      )}

      <div className="rethink-detail__content">
        <div className="rethink-prose">
          {places.map((place: Place) => (
            <div key={place.id}>
              {isGroup && <h2>{place.name}</h2>}
              <p>{place.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
