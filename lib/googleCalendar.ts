import crypto from "crypto";
import {
  BOOKING_SLOT_HOURS,
  blockWindow,
  detailHoursFor,
  PREP_HOURS,
  slotConflicts,
  type BusyInterval,
} from "./bookingRules";

export { BOOKING_SLOT_HOURS, blockWindow, detailHoursFor, PREP_HOURS, slotConflicts };
export type { BusyInterval };

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
  time: string; // appointment time, e.g. "1:00 PM"
  service?: string; // "exterior" | "interior" | "full" — sets the blocked window
  // Diagnostic override (calendar-test route only): exact event length in
  // hours starting AT the appointment time, with no prep hour before it.
  durationHours?: number;
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

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

// How many of the bookable slots on a date are free of calendar events, using
// the blocked window for the given service (prep hour + detail length).
// Sundays are closed, so they always report zero.
export function openSlotCount(
  date: string,
  busy: BusyInterval[],
  service?: string
): number {
  if (new Date(`${date}T12:00:00Z`).getUTCDay() === 0) return 0;
  const offset = easternOffset(date);
  let open = 0;
  for (const hour of BOOKING_SLOT_HOURS) {
    const slotStart = new Date(
      `${date}T${String(hour).padStart(2, "0")}:00:00${offset}`
    );
    if (slotConflicts(slotStart, busy, service).length === 0) open++;
  }
  return open;
}

// Returns the busy intervals on the business calendar across a date window.
// EVERY busy event blocks — detailing bookings and personal/task events
// alike. Detailing bookings are stored with their prep + detail buffer baked
// into the event window; every other event blocks exactly its own start–end
// time (see BusyInterval in bookingRules.ts). Skipped: cancelled events and
// events marked "free" (transparent) — those never block a slot. The read is
// paginated so a heavily time-blocked calendar can't silently truncate.
// Prefers reading directly as the service account; falls back to the public
// free/busy API-key lookup (which applies the same busy-only, free-excluded
// semantics); fails open (configured: false, no busy times) so the booking
// form never breaks if the calendar can't be reached.
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
      const busy: BusyInterval[] = [];
      let pageToken: string | undefined;
      // 10 pages × 2500 events is far beyond any real calendar; the cap only
      // guards against a runaway pagination loop.
      for (let page = 0; page < 10; page++) {
        const params = new URLSearchParams({
          timeMin,
          timeMax,
          singleEvents: "true",
          orderBy: "startTime",
          maxResults: "2500",
        });
        if (pageToken) params.set("pageToken", pageToken);
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
        const items: Array<{
          status?: string;
          transparency?: string;
          start?: { dateTime?: string; date?: string };
          end?: { dateTime?: string; date?: string };
        }> = json.items ?? [];
        for (const e of items) {
          if (e.status === "cancelled" || e.transparency === "transparent") continue;
          busy.push({
            // All-day events have only a date — they block their whole day(s)
            start: e.start?.dateTime ?? `${e.start?.date}T00:00:00${easternOffset(e.start?.date ?? startDate)}`,
            end: e.end?.dateTime ?? `${e.end?.date}T00:00:00${easternOffset(e.end?.date ?? endDate)}`,
          });
        }
        pageToken = json.nextPageToken;
        if (!pageToken) break;
      }
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
    // One event covers the whole blocked window: 1 hour of prep before the
    // appointment plus the detail itself (2h/3h/4h by service). A 10:00 AM
    // full detail blocks 9:00 AM – 2:00 PM. The diagnostic durationHours
    // override skips the prep hour and uses the exact length given.
    const slotStart = new Date(slotToStartISO(ev.date, ev.time));
    const window =
      ev.durationHours != null
        ? {
            start: slotStart,
            end: new Date(slotStart.getTime() + ev.durationHours * 60 * 60 * 1000),
          }
        : blockWindow(slotStart, ev.service);
    const start = window.start.toISOString();
    const end = window.end.toISOString();

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
