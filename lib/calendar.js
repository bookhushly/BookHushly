/**
 * Calendar utilities — Google Calendar URL, Outlook URL, .ics download
 * Pure functions safe to import in any client component.
 *
 * @param {string} eventDate  - "YYYY-MM-DD" (PostgreSQL DATE)
 * @param {string} eventTime  - "HH:MM" or "HH:MM:SS" (PostgreSQL TIME, optional)
 * Durations default to 3 hours when no end time is provided.
 */

function normalizeTime(eventTime) {
  if (!eventTime) return "00:00";
  return String(eventTime).slice(0, 5); // "HH:MM"
}

function toLocalCalDateTime(eventDate, eventTime) {
  if (!eventDate) return null;
  const [y, m, d] = eventDate.split("-");
  const [h, min] = normalizeTime(eventTime).split(":");
  return `${y}${m}${d}T${h}${min}00`; // e.g. "20260115T140000" (floating/local)
}

function addHours(eventDate, eventTime, hours) {
  const timeStr = normalizeTime(eventTime);
  const dt = new Date(`${eventDate}T${timeStr}:00`);
  if (isNaN(dt.getTime())) return null;
  dt.setTime(dt.getTime() + hours * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}` +
    `T${pad(dt.getHours())}${pad(dt.getMinutes())}00`
  );
}

function stripHtml(str) {
  return (str || "").replace(/<[^>]*>/g, "").trim();
}

/**
 * Returns a Google Calendar "add event" URL.
 * Opens in a new tab; no API key required.
 */
export function getGoogleCalendarUrl({ title, location, eventDate, eventTime, description = "" }) {
  const start = toLocalCalDateTime(eventDate, eventTime);
  if (!start) return null;
  const end = addHours(eventDate, eventTime, 3);
  if (!end) return null;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title || "Event",
    dates: `${start}/${end}`,
    details: stripHtml(description).slice(0, 500),
    location: (location || "").replace(/\n/g, ", "),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Returns an Outlook Web "add event" deep-link URL.
 */
export function getOutlookCalendarUrl({ title, location, eventDate, eventTime, description = "" }) {
  if (!eventDate) return null;
  const timeStr = normalizeTime(eventTime);
  const startDt = new Date(`${eventDate}T${timeStr}:00`);
  if (isNaN(startDt.getTime())) return null;
  const endDt = new Date(startDt.getTime() + 3 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: title || "Event",
    startdt: startDt.toISOString(),
    enddt: endDt.toISOString(),
    body: stripHtml(description).slice(0, 500),
    location: (location || "").replace(/\n/g, ", "),
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Triggers a .ics file download (Apple Calendar / generic iCal).
 * Safe to call only in browser context.
 */
export function downloadICS({ title, location, eventDate, eventTime, description = "" }) {
  if (typeof window === "undefined" || !eventDate) return;

  const timeStr = normalizeTime(eventTime);
  const startDt = new Date(`${eventDate}T${timeStr}:00`);
  if (isNaN(startDt.getTime())) return;
  const endDt = new Date(startDt.getTime() + 3 * 60 * 60 * 1000);

  const fmt = (dt) => {
    const pad = (n) => String(n).padStart(2, "0");
    return (
      `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}` +
      `T${pad(dt.getHours())}${pad(dt.getMinutes())}00`
    );
  };

  const esc = (s) =>
    (s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BookHushly//Event//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(startDt)}`,
    `DTEND:${fmt(endDt)}`,
    `SUMMARY:${esc(title || "Event")}`,
    `LOCATION:${esc((location || "").replace(/\n/g, ", "))}`,
    `DESCRIPTION:${esc(stripHtml(description)).slice(0, 500)}`,
    `UID:${Date.now()}-${Math.random().toString(36).slice(2, 9)}@bookhushly.com`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(title || "event").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
