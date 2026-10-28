import { NextRequest, NextResponse } from "next/server";
import {
  createBookingEvent,
  getBusyWindow,
  openSlotCount,
  resolveCalendarId,
  resolveBusyCalendarIds,
  addDays,
} from "@/lib/googleCalendar";
import { BOOKING_SLOT_HOURS, blockWindow, detailHoursFor, PREP_HOURS } from "@/lib/bookingRules";

// TEMPORARY diagnostic endpoint for the Google Calendar integration.
//
//   ?token=…              → creates a test event (checks WRITE access)
//   ?token=…&mode=read    → reads busy times, creates nothing (checks READ
//                           access, i.e. whether calendar events actually
//                           block booking slots)
//   …&date=YYYY-MM-DD     → with mode=read, shows every slot on that date and
//                           why it is open or blocked
//
// Remove once the integration is confirmed.

const TEST_TOKEN = "ats-cal-test-7f3k9";
const READ_DAYS = 14;

function todayEastern(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(
    new Date()
  );
}

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("token") !== TEST_TOKEN) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const serviceAccountConfigured = Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  );

  // ── Read mode: prove that calendar events block slots. Creates nothing. ──
  if (req.nextUrl.searchParams.get("mode") === "read") {
    const start = todayEastern();
    const end = addDays(start, READ_DAYS);
    const { configured, busy } = await getBusyWindow(start, end);

    const date = req.nextUrl.searchParams.get("date");
    const service = req.nextUrl.searchParams.get("service") ?? "full";

    let slots: { time: string; open: boolean; blockedBy?: string[] }[] | undefined;
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      slots = BOOKING_SLOT_HOURS.map((hour) => {
        const slotStart = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00`);
        const { start: bStart, end: bEnd } = blockWindow(slotStart, service);
        const clashes = busy
          .filter((b) => bStart < new Date(b.end) && bEnd > new Date(b.start))
          .map((b) => `${b.start} → ${b.end}`);
        return {
          time: slotStart.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          open: clashes.length === 0,
          ...(clashes.length ? { blockedBy: clashes } : {}),
        };
      });
    }

    return NextResponse.json({
      mode: "read",
      calendarsRead: resolveBusyCalendarIds(),
      serviceAccountConfigured,
      calendarReachable: configured,
      window: { start, end },
      busyCount: busy.length,
      busy,
      ...(date
        ? {
            date,
            service,
            hoursBlockedPerBooking: PREP_HOURS + detailHoursFor(service),
            openSlots: openSlotCount(date, busy, service),
            slots,
          }
        : {}),
    });
  }

  // ── Default: write test (unchanged) ──
  const result = await createBookingEvent({
    summary: "CALENDAR INTEGRATION TEST — safe to delete",
    description:
      "Created by the website's diagnostic endpoint to verify the booking → calendar flow.",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "7:00 AM",
    durationHours: 1,
  });

  return NextResponse.json({
    calendarId: resolveCalendarId(),
    serviceAccountConfigured,
    result,
  });
}
