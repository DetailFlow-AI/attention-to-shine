"use client";

import { usePathname } from "next/navigation";

/**
 * Task 8 — Reserved slot for the future "Shine" AI chatbot. DONE 2026-06-26
 *
 * This intentionally renders NO chatbot yet — it only reserves the
 * bottom-right corner on every page except the booking flow, and marks
 * exactly where the widget will mount. Do not build the chatbot here;
 * drop the future <Shine /> widget inside the marked container below.
 */
export default function ShinePlaceholder() {
  const pathname = usePathname();

  // Excluded from the booking page so the widget never overlaps the
  // multi-step booking form / payment UI.
  if (pathname?.startsWith("/booking")) return null;

  return (
    // Reserved bottom-right slot for the "Shine" chatbot.
    <div
      id="shine-chatbot-slot"
      aria-hidden="true"
      className="fixed bottom-6 right-6 z-40 pointer-events-none"
    >
      {/* TODO(Shine chatbot): mount the future <Shine /> AI assistant widget here. */}
    </div>
  );
}
