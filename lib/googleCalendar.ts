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
  durationHours?: number;
}

export async function createBookingEvent(ev: BookingEvent): Promise<boolean> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "lilliechris06@gmail.com";
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
    return false;
  }

  try {
    const token = await getAccessToken(saEmail, saKey);
    const start = slotToStartISO(ev.date, ev.time);
    const end = new Date(
      new Date(start).getTime() + (ev.durationHours ?? 3) * 60 * 60 * 1000
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
      console.error(
        "Calendar event creation failed:",
        res.status,
        await res.text()
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("Calendar event error:", error);
    return false;
  }
}
