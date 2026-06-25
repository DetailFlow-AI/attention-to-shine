"use client";

import { usePathname } from "next/navigation";

// TASK 8 — Chatbot placeholder ("Shine"): DONE 2026-06-25
//
// Reserves the bottom-right corner of every page EXCEPT the booking page for a
// future AI chatbot named "Shine". The chatbot itself is NOT built yet — this
// component intentionally renders no visible UI; it only marks and reserves the
// slot so the future widget has a consistent, conflict-free home.
//
// ┌─────────────────────────────────────────────────────────────────────┐
// │  FUTURE WORK — mount the "Shine" AI chatbot widget inside the slot    │
// │  below (the fixed bottom-right container). Do not add it to /booking. │
// └─────────────────────────────────────────────────────────────────────┘

export default function ShinePlaceholder() {
  const pathname = usePathname();

  // Excluded on the booking flow so the chatbot never overlaps the booking UI.
  if (pathname?.startsWith("/booking")) return null;

  return (
    <div
      id="shine-chatbot-slot"
      aria-hidden="true"
      data-chatbot="shine"
      className="fixed bottom-6 right-6 z-40 pointer-events-none"
    >
      {/* TODO(Shine): the AI chatbot "Shine" will be mounted here. Placeholder only — do not build yet. */}
    </div>
  );
}
