"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface LightboxPhoto {
  src: string;
  caption?: string;
}

interface PhotoLightboxProps {
  photos: LightboxPhoto[];
  // Index into `photos`, or null when closed.
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}

export default function PhotoLightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: PhotoLightboxProps) {
  const isOpen = index !== null && index >= 0 && index < photos.length;

  const step = useCallback(
    (delta: number) => {
      if (index === null || photos.length === 0) return;
      // Wrap around so the arrows never dead-end.
      onIndexChange((index + delta + photos.length) % photos.length);
    },
    [index, photos.length, onIndexChange]
  );

  // Escape closes; arrows move between photos.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, step]);

  // Stop the page behind the overlay from scrolling while it's open.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (!isOpen) return null;
  const photo = photos[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption ?? "Enlarged photo"}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-navy/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
      >
        <X size={20} />
      </button>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Previous photo"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Next photo"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Clicking the image itself shouldn't dismiss the overlay. */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl h-[70vh] sm:h-[75vh]"
      >
        <Image
          src={photo.src}
          alt={photo.caption ?? "Detailing work by Attention to Shine"}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="mt-5 text-center max-w-2xl"
      >
        {photo.caption && (
          <p className="text-sm text-white/80">{photo.caption}</p>
        )}
        <p className="text-xs text-white/40 mt-1">
          {index + 1} of {photos.length}
        </p>
      </div>
    </div>
  );
}
