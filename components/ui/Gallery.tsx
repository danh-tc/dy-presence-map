"use client";
import { useState, useEffect, useCallback } from "react";
import BlurImage from "./BlurImage";

interface GalleryProps {
  images: string[];
  alt: string;
}

const PREVIEW_LIMIT = 6;

export function Gallery({ images, alt }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images.length) return null;

  const preview = images.slice(0, PREVIEW_LIMIT);
  const remaining = images.length - PREVIEW_LIMIT;
  const hasMore = remaining > 0;

  return (
    <>
      <div className="rethink-detail__gallery">
        {preview.map((src, i) => {
          const isLastAndHasMore = hasMore && i === PREVIEW_LIMIT - 1;
          return (
            <button
              key={src}
              className="rethink-detail__gallery-item"
              onClick={() => setLightboxIndex(i)}
              aria-label={
                isLastAndHasMore
                  ? `Xem thêm ${remaining + 1} ảnh`
                  : `${alt} - ảnh ${i + 1}`
              }
            >
              <BlurImage
                src={src}
                alt={`${alt} - ảnh ${i + 1}`}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {isLastAndHasMore && (
                <div className="rethink-detail__gallery-more">
                  <span>+{remaining + 1}</span>
                  <span>Xem thêm</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          alt={alt}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

function Lightbox({
  images,
  alt,
  initialIndex,
  onClose,
}: {
  images: string[];
  alt: string;
  initialIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(initialIndex);
  const count = images.length;

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + count) % count),
    [count]
  );
  const next = useCallback(
    () => setCurrent((c) => (c + 1) % count),
    [count]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  return (
    <div
      className="rethink-lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh"
    >
      <button
        className="rethink-lightbox__close"
        onClick={onClose}
        aria-label="Đóng"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div
        className="rethink-lightbox__stage"
        onClick={(e) => e.stopPropagation()}
      >
        <BlurImage
          src={images[current]}
          alt={`${alt} - ảnh ${current + 1}`}
          fill
          style={{ objectFit: "contain" }}
          sizes="100vw"
          priority
        />
      </div>

      {count > 1 && (
        <>
          <button
            className="rethink-lightbox__nav rethink-lightbox__nav--prev"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Ảnh trước"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className="rethink-lightbox__nav rethink-lightbox__nav--next"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Ảnh tiếp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <div className="rethink-lightbox__counter">
            {current + 1} / {count}
          </div>
        </>
      )}
    </div>
  );
}
