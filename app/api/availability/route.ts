import { NextRequest, NextResponse } from "next/server";
import { easternOffset } from "@/lib/googleCalendar";

// Returns the busy time ranges from the owner's Google Calendar for a given
// date so the booking form can grey out taken slots.
//
// Requires two env vars (see SETUP.md):
//   GOOGLE_CALENDAR_ID      — the calendar's ID (usually your Gmail address)
//   GOOGLE_CALENDAR_API_KEY — a Google API key with the Calendar API enabled
// The calendar's free/busy visibility must be public for API-key access.
//
// If not configured, every slot is reported available so booking still works.

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Valid date (YYYY-MM-DD) required" }, { status: 400 });
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  if (!calendarId || !apiKey) {
    return NextResponse.json({ configured: false, busy: [] });
  }

  try {
    const offset = easternOffset(date);
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/freeBusy?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeMin: `${date}T00:00:00${offset}`,
          timeMax: `${date}T23:59:59${offset}`,
          timeZone: "America/New_York",
          items: [{ id: calendarId }],
        }),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error("Calendar freeBusy error:", res.status, await res.text());
      return NextResponse.json({ configured: true, busy: [] });
    }

    const json = await res.json();
    const busy: { start: string; end: string }[] =
      json.calendars?.[calendarId]?.busy ?? [];

    return NextResponse.json({ configured: true, busy });
  } catch (error) {
    console.error("Availability route error:", error);
    // Fail open — never block bookings because the calendar check failed
    return NextResponse.json({ configured: true, busy: [] });
  }
}
