"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, Images, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Task 1.3.2 - photo gallery for the hotel page.
// Data: GET /hotels/{id}/images (task 1.3.1, Darren) -> pass `images` (or `rooms[type]`).
// First image is the cover. Empty list shows a "No photos yet" placeholder.
// Sizes: thumb (480w) for the strip, medium (1024w) for the main view, large (1920w) full-screen.
// Plain <img> on purpose: the URLs point at the API, so next/image would need next.config changes.

export type GalleryImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
  sizes: { thumb: string; medium: string; large: string };
};

type PhotoGalleryProps = {
  images: GalleryImage[];
  /** Hotel or room name, used when an image has no alt text. */
  title?: string;
  className?: string;
};

export default function PhotoGallery({ images, title = "Hotel", className }: PhotoGalleryProps) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const count = images.length;
  const safeIndex = count > 0 ? Math.min(index, count - 1) : 0;
  const current = images[safeIndex];
  const altFor = (img: GalleryImage, i: number) => img.alt?.trim() || `${title} photo ${i + 1}`;

  if (count === 0) {
    return (
      <div
        className={cn(
          "flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line-strong bg-surface-muted text-muted",
          className
        )}
      >
        <ImageOff aria-hidden="true" className="h-8 w-8 text-subtle" />
        <p className="text-sm">No photos yet</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main photo */}
      <div className="relative overflow-hidden rounded-card bg-surface-muted">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset"
          aria-label={`Open photo ${safeIndex + 1} of ${count} full screen`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.sizes.medium}
            srcSet={`${current.sizes.medium} 1024w, ${current.sizes.large} 1920w`}
            sizes="(min-width: 1024px) 66vw, 100vw"
            alt={altFor(current, safeIndex)}
            width={current.width}
            height={current.height}
            className="aspect-[16/9] w-full object-cover"
          />
        </button>

        {count > 1 && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-control bg-surface/90 px-3 py-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur hover:bg-surface cursor-pointer"
          >
            <Images aria-hidden="true" className="h-4 w-4" />
            View all {count} photos
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {count > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Photos">
          {images.map((img, i) => (
            <li key={img.url} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === safeIndex ? "true" : undefined}
                className={cn(
                  "block overflow-hidden rounded-control border-2 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                  i === safeIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.sizes.thumb}
                  alt=""
                  loading="lazy"
                  className="h-16 w-24 object-cover sm:h-20 sm:w-28"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <Lightbox
          images={images}
          index={safeIndex}
          onIndexChange={setIndex}
          onClose={() => setOpen(false)}
          altFor={altFor}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
  altFor,
}: {
  images: GalleryImage[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  altFor: (img: GalleryImage, i: number) => string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = images.length;
  const img = images[index];

  const prev = useCallback(() => onIndexChange((index - 1 + count) % count), [index, count, onIndexChange]);
  const next = useCallback(() => onIndexChange((index + 1) % count), [index, count, onIndexChange]);

  // Keyboard: Esc closes, arrows move. Lock page scroll while open, restore focus after.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && count > 1) prev();
      else if (e.key === "ArrowRight" && count > 1) next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next, count]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-[100] flex flex-col bg-black/90"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 text-sm text-white">
        <span aria-live="polite">
          {index + 1} / {count}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className="rounded-full p-2 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
        >
          <X aria-hidden="true" className="h-6 w-6" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-6 sm:px-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.sizes.large}
          alt={altFor(img, index)}
          width={img.width}
          height={img.height}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full rounded-control object-contain"
        />

        {count > 1 && (
          <>
            <LightboxArrow side="left" label="Previous photo" onClick={prev} />
            <LightboxArrow side="right" label="Next photo" onClick={next} />
          </>
        )}
      </div>
    </div>
  );
}

function LightboxArrow({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer",
        side === "left" ? "left-2 sm:left-4" : "right-2 sm:right-4"
      )}
    >
      <Icon aria-hidden="true" className="h-6 w-6" />
    </button>
  );
}
