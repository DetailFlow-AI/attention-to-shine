"use client";

import { usePathname } from "next/navigation";

// TASK 8 — DONE 2026-06-20: Chatbot placeholder (NOT YET BUILT).
//
// Reserves the bottom-right corner of every page EXCEPT the booking flow for a
// future AI chatbot named "Shine". For now this intentionally renders nothing
// visible — it only marks and reserves the spot in the layout. Do not build the
// chatbot here yet.
//
// When the time comes, mount the Shine chat widget inside the container below
// (e.g. a floating launcher button + chat panel). The fixed bottom-right
// position and z-index are already set so the widget lands in the right place.
export default function ShinePlaceholder() {
  const pathname = usePathname();

  // The booking page is excluded so the widget never overlaps the booking flow.
  if (pathname?.startsWith("/booking")) return null;

  return (
    <div
      id="shine-chatbot-placeholder"
      data-chatbot="shine"
      aria-hidden="true"
      className="fixed bottom-6 right-6 z-40 pointer-events-none"
    >
      {/* ── SHINE AI CHATBOT GOES HERE (future) ── */}
    </div>
  );
}
