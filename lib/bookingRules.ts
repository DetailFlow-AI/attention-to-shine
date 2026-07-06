// Shared booking-duration rules, used by BOTH the server (calendar event
// creation in lib/googleCalendar.ts, the availability API) and the client
// (booking form slot checks). Keeping them in this one dependency-free module
// guarantees the calendar block and the availability check never disagree.
//
// Every booking blocks ONE window: 1 hour of prep BEFORE the appointment,
// then the detail itself. Total blocked time per service:
//   exterior → 1 + 2 = 3 hours  (8:00 AM booking blocks 7:00 AM–10:00 AM)
//   interior → 1 + 3 = 4 hours  (4:00 PM booking blocks 3:00 PM–7:00 PM)
//   full     → 1 + 4 = 5 hours  (10:00 AM booking blocks 9:00 AM–2:00 PM)

export const PREP_HOURS = 1;

// Length of the detail itself (prep not included), keyed by the service ids
// used across the booking form and API routes.
export const SERVICE_DETAIL_HOURS: Record<string, number> = {
  exterior: 2,
  interior: 3,
  full: 4,
};

// Unknown or missing service falls back to the longest detail so an
// availability check without a service can never under-block.
export function detailHoursFor(service?: string): number {
  return SERVICE_DETAIL_HOURS[service ?? ""] ?? SERVICE_DETAIL_HOURS.full;
}

// Service words used in calendar event titles — the title shows the
// appointment time (never the prep time), e.g. "Exterior Detail at 10:00 AM".
export const CALENDAR_SERVICE_LABELS: Record<string, string> = {
  exterior: "Exterior Detail",
  interior: "Interior Detail",
  full: "Full Detail",
};

// Booking slots offered on the form: 7:00 AM through 5:00 PM, hourly
export const BOOKING_SLOT_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

const HOUR_MS = 60 * 60 * 1000;

// Given the appointment time of a slot, returns the [start, end) window it
// blocks: start = appointment − 1 hour prep, end = appointment + detail length.
export function blockWindow(
  slotStart: Date,
  service?: string
): { start: Date; end: Date } {
  return {
    start: new Date(slotStart.getTime() - PREP_HOURS * HOUR_MS),
    end: new Date(slotStart.getTime() + detailHoursFor(service) * HOUR_MS),
  };
}
