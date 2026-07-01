"use client";

import { usePathname } from "next/navigation";

// TASK 8 — CHATBOT PLACEHOLDER (Do Not Build Yet) — DONE 2026-07-01
//
// Reserves the bottom-right corner of every page EXCEPT the booking page for a
// future AI chatbot named "Shine". Nothing is rendered visually yet and no
// chatbot logic exists — this only marks and holds the space so the widget can
// drop in later without a layout shift.
//
// ┌─────────────────────────────────────────────────────────────────────┐
// │  FUTURE CHATBOT "SHINE" GOES HERE.                                    │
// │  Replace the empty reserved slot below with the chat launcher button  │
// │  and panel. Keep the /booking exclusion so it never overlaps the      │
// │  booking flow. Do NOT build the chatbot until explicitly requested.   │
// └─────────────────────────────────────────────────────────────────────┘

export default function ChatbotSlot() {
  const pathname = usePathname();

  // Excluded on the booking page per spec.
  if (pathname?.startsWith("/booking")) return null;

  return (
    <div
      id="shine-chatbot-slot"
      aria-hidden="true"
      className="fixed bottom-5 right-5 z-40 w-16 h-16 pointer-events-none"
    >
      {/* Placeholder — the "Shine" chatbot launcher will render here. */}
    </div>
  );
}
