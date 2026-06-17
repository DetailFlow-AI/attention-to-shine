import crypto from "crypto";

// Creates events on the owner's Google Calendar using a service account.
//
// Requires (see SETUP.md):
//   GOOGLE_CALENDAR_ID                  — the calendar to write to
//   GOOGLE_SERVICE_ACCOUNT_EMAIL        — from the service account JSON key
//   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY  — from the same JSON key
// The calendar must be shared with the service account email with
// "Make changes to events" permission.
//
// If not configured, event creation is skipped and logged — bookings still work.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/calendar.events";

export function easternOffset(date: string): string {
  const probe = new Date(`${date}T12:00:00Z`);
  const tz = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "shortOffset",
  })
    .formatToParts(probe)
    .find((p) => p.type === "timeZoneName")?.value;
  const match = tz?.match(/GMT([+-]\d+)/);
  const hours = match ? parseInt(match[1], 10) : -5;
  const sign = hours < 0 ? "-" : "+";
  return `${sign}${String(Math.abs(hours)).padStart(2, "0")}:00`;
}

// "2026-06-15" + "1:00 PM" → "2026-06-15T13:00:00-04:00"
export function slotToStartISO(date: string, time: string): string {
  const [hm, ap] = time.split(" ");
  let hour = parseInt(hm, 10);
  if (ap === "PM" && hour !== 12) hour += 12;
  if (ap === "AM" && hour === 12) hour = 0;
  return `${date}T${String(hour).padStart(2, "0")}:00:00${easternOffset(date)}`;
}

// Tolerates the common ways a private key gets mangled when pasted into an
// env var: surrounding quotes, literal \n sequences instead of newlines.
function normalizePrivateKey(raw: string): string {
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\n/g, "\n");
  if (!key.includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY doesn't look like a PEM key — paste the full private_key value from the service account JSON file, including the -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY----- lines"
    );
  }
  return key;
}

async function getAccessToken(email: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" })
  ).toString("base64url");
  const claims = Buffer.from(
    JSON.stringify({
      iss: email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  ).toString("base64url");

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = signer
    .sign(normalizePrivateKey(privateKey))
    .toString("base64url");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()).access_token;
}

export interface BookingEvent {
  summary: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "1:00 PM"
  durationHours?: number; // length of the booking in hours from the start (default 5)
}

// Resolves the calendar to write to. Falls back to the business calendar when
// the env var is unset, empty, quoted, or set to "primary" — which for a
// service account would mean the robot's own (invisible) calendar.
export function resolveCalendarId(): string {
  const raw = (process.env.GOOGLE_CALENDAR_ID ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "");
  if (!raw || raw === "primary") return "lilliechris06@gmail.com";
  return raw;
}

export interface CalendarResult {
  ok: boolean;
  error?: string;
}

export interface BusyInterval {
  start: string;
  end: string;
}

// Booking slots offered on the form: 7:00 AM through 5:00 PM, hourly
export const BOOKING_SLOT_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

// TASK 1 — BOOKING TIME BLOCKS (DONE 2026-06-17)
// Each booking reserves the 5 hours starting at the booked time — the length
// of a detail plus buffer, to prevent double bookings. A 10:00 AM booking
// blocks 10:00 AM – 3:00 PM; nothing before the start time is blocked. The
// availability check uses the same window: a slot is taken if the 5-hour
// window starting there would overlap an existing event, so a slot stays
// open only when a full 5-hour block fits before the next booking.
export const BOOKING_BLOCK_HOURS = 5;

// Given the start time of a slot, returns the [start, end) window it blocks.
export function blockWindow(slotStart: Date): { start: Date; end: Date } {
  return {
    start: slotStart,
    end: new Date(slotStart.getTime() + BOOKING_BLOCK_HOURS * 60 * 60 * 1000),
  };
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

// How many of the bookable slots on a date are free of calendar events.
// Sundays are closed, so they always report zero.
export function openSlotCount(date: string, busy: BusyInterval[]): number {
  if (new Date(`${date}T12:00:00Z`).getUTCDay() === 0) return 0;
  const offset = easternOffset(date);
  let open = 0;
  for (const hour of BOOKING_SLOT_HOURS) {
    const slotStart = new Date(
      `${date}T${String(hour).padStart(2, "0")}:00:00${offset}`
    );
    const { start: blockStart, end: blockEnd } = blockWindow(slotStart);
    const taken = busy.some(
      (b) => blockStart < new Date(b.end) && blockEnd > new Date(b.start)
    );
    if (!taken) open++;
  }
  return open;
}

// Returns the busy intervals on the business calendar across a date window.
// Prefers reading directly as the service account; falls back to the public
// free/busy API-key lookup; fails open (configured: false, no busy times) so
// the booking form never breaks if the calendar can't be reached.
export async function getBusyWindow(
  startDate: string,
  endDate: string
): Promise<{ configured: boolean; busy: BusyInterval[] }> {
  const calendarId = resolveCalendarId();
  const timeMin = `${startDate}T00:00:00${easternOffset(startDate)}`;
  const timeMax = `${endDate}T23:59:59${easternOffset(endDate)}`;

  const saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const saKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (saEmail && saKey) {
    try {
      const token = await getAccessToken(saEmail, saKey);
      const params = new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "250",
      });
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      if (!res.ok) {
        console.error("Busy-window fetch failed:", res.status, await res.text());
        return { configured: true, busy: [] };
      }
      const json = await res.json();
      const busy = (json.items ?? [])
        .filter(
          (e: { status?: string; transparency?: string }) =>
            e.status !== "cancelled" && e.transparency !== "transparent"
        )
        .map(
          (e: {
            start?: { dateTime?: string; date?: string };
            end?: { dateTime?: string; date?: string };
          }) => ({
            // All-day events have only a date — they block their whole day(s)
            start: e.start?.dateTime ?? `${e.start?.date}T00:00:00${easternOffset(e.start?.date ?? startDate)}`,
            end: e.end?.dateTime ?? `${e.end?.date}T00:00:00${easternOffset(e.end?.date ?? endDate)}`,
          })
        );
      return { configured: true, busy };
    } catch (error) {
      console.error("Busy-window error:", error);
      return { configured: true, busy: [] };
    }
  }

  // Fallback: public free/busy via API key
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  if (!apiKey) return { configured: false, busy: [] };

  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/freeBusy?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeMin,
          timeMax,
          timeZone: "America/New_York",
          items: [{ id: calendarId }],
        }),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      console.error("Calendar freeBusy error:", res.status, await res.text());
      return { configured: true, busy: [] };
    }
    const json = await res.json();
    return {
      configured: true,
      busy: json.calendars?.[calendarId]?.busy ?? [],
    };
  } catch (error) {
    console.error("Availability fallback error:", error);
    return { configured: true, busy: [] };
  }
}

export async function createBookingEvent(ev: BookingEvent): Promise<CalendarResult> {
  const calendarId = resolveCalendarId();
  const saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const saKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!saEmail || !saKey) {
    const missing = [
      !saEmail && "GOOGLE_SERVICE_ACCOUNT_EMAIL",
      !saKey && "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
    ]
      .filter(Boolean)
      .join(", ");
    console.log(
      `📅 Calendar event skipped — missing env var(s): ${missing} —`,
      ev.summary
    );
    return { ok: false, error: `Missing env var(s): ${missing}` };
  }

  try {
    const token = await getAccessToken(saEmail, saKey);
    // Reserve the 5 hours starting at the booked time (detail + buffer).
    // A 10:00 AM booking blocks 10:00 AM – 3:00 PM on the calendar.
    const slotStart = new Date(slotToStartISO(ev.date, ev.time));
    const start = slotStart.toISOString();
    const end = new Date(
      slotStart.getTime() +
        (ev.durationHours ?? BOOKING_BLOCK_HOURS) * 60 * 60 * 1000
    ).toISOString();

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: ev.summary,
          description: ev.description,
          start: { dateTime: start, timeZone: "America/New_York" },
          end: { dateTime: end, timeZone: "America/New_York" },
        }),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error(
        `Calendar event creation failed (calendar: ${calendarId}):`,
        res.status,
        body
      );
      return {
        ok: false,
        error: `Calendar API ${res.status} (calendar: ${calendarId}): ${body}`,
      };
    }
    return { ok: true };
  } catch (error) {
    console.error("Calendar event error:", error);
    return { ok: false, error: String(error) };
  }
}
