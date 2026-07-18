import { NextRequest, NextResponse } from "next/server";
import {
  addDays,
  getBusyWindow,
  openSlotCount,
  type BusyInterval,
} from "@/lib/googleCalendar";

// Availability for the booking form, read from the owner's Google Calendar.
//
// Modes:
//   ?date=YYYY-MM-DD            → busy intervals for that day (time dropdown)
//   ?start=YYYY-MM-DD&days=N    → open-slot count per day (date picker grid)
//
// Both modes accept &service=exterior|interior|full so open-slot counts use
// that service's blocked window (1 hr prep + detail length). Without it, the
// longest window is assumed.
//
// A slot is blocked by ANY busy event on the calendar, not just detailing
// bookings: bookings carry their prep + detail buffer in the stored event,
// personal/task events block exactly their own start–end time, and events
// marked "free" (transparent) never block (see getBusyWindow/slotConflicts).
//
// Every response also includes `nextAvailable`: the soonest upcoming date
// with at least one open slot, scanned over the next 45 days.
// Fails open — if the calendar can't be reached, everything reports available
// so customers are never blocked from booking.

const SCAN_DAYS = 45;

function todayEastern(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
  }).format(new Date());
}

function nextAvailableDate(busy: BusyInterval[], service?: string): string | null {
  const tomorrow = addDays(todayEastern(), 1);
  for (let i = 0; i < SCAN_DAYS; i++) {
    const d = addDays(tomorrow, i);
    if (openSlotCount(d, busy, service) > 0) return d;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  const start = req.nextUrl.searchParams.get("start");
  const daysParam = parseInt(req.nextUrl.searchParams.get("days") ?? "0", 10);
  const service = req.nextUrl.searchParams.get("service") ?? undefined;

  const tomorrow = addDays(todayEastern(), 1);
  const scanEnd = addDays(tomorrow, SCAN_DAYS);

  // ── Range mode: per-day open slot counts for the date picker ──
  if (start && /^\d{4}-\d{2}-\d{2}$/.test(start) && daysParam > 0) {
    const days = Math.min(daysParam, 62);
    const rangeEnd = addDays(start, days - 1);
    const windowStart = start < tomorrow ? start : tomorrow;
    const windowEnd = rangeEnd > scanEnd ? rangeEnd : scanEnd;

    const { configured, busy } = await getBusyWindow(windowStart, windowEnd);

    const openByDay: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = addDays(start, i);
      openByDay[d] = openSlotCount(d, busy, service);
    }

    return NextResponse.json({
      configured,
      days: openByDay,
      nextAvailable: nextAvailableDate(busy, service),
    });
  }

  // ── Single-date mode: busy intervals for the time dropdown ──
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const windowStart = date < tomorrow ? date : tomorrow;
    const windowEnd = date > scanEnd ? date : scanEnd;

    const { configured, busy } = await getBusyWindow(windowStart, windowEnd);

    // Only the requested day's intervals matter to the time dropdown
    const dayStart = new Date(`${date}T00:00:00-05:00`).getTime() - 60 * 60 * 1000;
    const dayEnd = new Date(`${date}T23:59:59-04:00`).getTime() + 60 * 60 * 1000;
    const dayBusy = busy.filter((b) => {
      const s = new Date(b.start).getTime();
      const e = new Date(b.end).getTime();
      return s < dayEnd && e > dayStart;
    });

    return NextResponse.json({
      configured,
      busy: dayBusy,
      nextAvailable: nextAvailableDate(busy, service),
    });
  }

  return NextResponse.json(
    { error: "Provide ?date=YYYY-MM-DD or ?start=YYYY-MM-DD&days=N" },
    { status: 400 }
  );
}
