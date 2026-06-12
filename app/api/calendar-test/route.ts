import { NextRequest, NextResponse } from "next/server";
import { createBookingEvent, resolveCalendarId } from "@/lib/googleCalendar";

// TEMPORARY diagnostic endpoint to verify the service account can create
// calendar events in production. Remove after the integration is confirmed.

const TEST_TOKEN = "ats-cal-test-7f3k9";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("token") !== TEST_TOKEN) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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
