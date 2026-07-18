import { NextRequest, NextResponse } from "next/server";
import {
  BOOKING_SLOT_HOURS,
  createBookingEvent,
  easternOffset,
  getBusyWindow,
  openSlotCount,
  resolveCalendarId,
  slotConflicts,
  type BusyInterval,
} from "@/lib/googleCalendar";
import { SERVICE_DETAIL_HOURS, slotLabel } from "@/lib/bookingRules";

// TEMPORARY diagnostic endpoint to verify the calendar integration in
// production. Remove after the integration is confirmed.
//
//   ?token=…                              → creates a 1-hour test event
//                                           (verifies the WRITE path)
//   ?token=…&mode=availability&date=YYYY-MM-DD [&service=exterior|interior|full]
//                                         → read-only: the busy intervals read
//                                           for that date and, per slot, which
//                                           services are open vs blocked and by
//                                           which busy interval(s) — the exact
//                                           slotConflicts()/openSlotCount()
//                                           logic the booking form and
//                                           availability API use (verifies the
//                                           READ/blocking path)

const TEST_TOKEN = "ats-cal-test-7f3k9";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("token") !== TEST_TOKEN) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (req.nextUrl.searchParams.get("mode") === "availability") {
    const date = req.nextUrl.searchParams.get("date") ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Provide &date=YYYY-MM-DD" },
        { status: 400 }
      );
    }
    const serviceParam = req.nextUrl.searchParams.get("service");
    const services = serviceParam
      ? [serviceParam]
      : Object.keys(SERVICE_DETAIL_HOURS);

    const { configured, busy } = await getBusyWindow(date, date);
    const offset = easternOffset(date);

    const slots = BOOKING_SLOT_HOURS.map((hour) => {
      const slotStart = new Date(
        `${date}T${String(hour).padStart(2, "0")}:00:00${offset}`
      );
      const verdicts: Record<
        string,
        { open: boolean; blockedBy?: BusyInterval[] }
      > = {};
      for (const service of services) {
        const conflicts = slotConflicts(slotStart, busy, service);
        verdicts[service] =
          conflicts.length === 0
            ? { open: true }
            : { open: false, blockedBy: conflicts };
      }
      return { time: slotLabel(hour), ...verdicts };
    });

    return NextResponse.json({
      mode: "availability",
      calendarId: resolveCalendarId(),
      configured,
      date,
      closedSunday: new Date(`${date}T12:00:00Z`).getUTCDay() === 0,
      // What the date-picker grid reports for this date (0 on Sundays)
      openSlotCount: Object.fromEntries(
        services.map((s) => [s, openSlotCount(date, busy, s)])
      ),
      busy,
      slots,
    });
  }

  const result = await createBookingEvent({
    summary: "CALENDAR INTEGRATION TEST — safe to delete",
    description: "Created by the website's diagnostic endpoint to verify the booking → calendar flow.",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "7:00 AM",
    durationHours: 1,
  });

  return NextResponse.json({
    calendarId: resolveCalendarId(),
    serviceAccountConfigured: Boolean(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
        process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    ),
    result,
  });
}
