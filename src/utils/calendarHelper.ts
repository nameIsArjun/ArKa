export interface CalendarEventParams {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  dateStr: string;
  timeStr?: string;
  venueName?: string;
  address?: string;
  dressCode?: string;
}

interface ParsedTimeIST {
  startHourIst: number;
  startMinIst: number;
  endHourIst: number;
  endMinIst: number;
}

/**
 * Parses time strings (e.g., "10:00 AM Onwards", "7:00 PM – Late Night", "5:00 PM – 7:00 PM")
 * into exact Indian Standard Time (IST, UTC+5:30) start and end hours/minutes.
 */
export function parseEventTimeIST(timeStr?: string): ParsedTimeIST {
  if (!timeStr) {
    return { startHourIst: 19, startMinIst: 0, endHourIst: 23, endMinIst: 0 };
  }

  // Look for time matches like "10:00 AM", "7:00 PM", "9:30 AM"
  const timeMatches = Array.from(timeStr.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi));

  if (timeMatches.length > 0) {
    const first = timeMatches[0];
    let h1 = parseInt(first[1], 10);
    const m1 = first[2] ? parseInt(first[2], 10) : 0;
    const ampm1 = first[3].toUpperCase();

    if (ampm1 === 'PM' && h1 < 12) h1 += 12;
    if (ampm1 === 'AM' && h1 === 12) h1 = 0;

    let h2 = (h1 + 4) % 24; // Default 4 hours event duration
    let m2 = m1;

    // If an explicit end time is listed (e.g. "5:00 PM – 7:00 PM")
    if (timeMatches.length >= 2) {
      const second = timeMatches[1];
      let endH = parseInt(second[1], 10);
      const endM = second[2] ? parseInt(second[2], 10) : 0;
      const endAmpm = second[3].toUpperCase();

      if (endAmpm === 'PM' && endH < 12) endH += 12;
      if (endAmpm === 'AM' && endH === 12) endH = 0;

      h2 = endH;
      m2 = endM;
    }

    return {
      startHourIst: h1,
      startMinIst: m1,
      endHourIst: h2,
      endMinIst: m2,
    };
  }

  // Default fallback: 7:00 PM to 11:00 PM IST
  return { startHourIst: 19, startMinIst: 0, endHourIst: 23, endMinIst: 0 };
}

/**
 * Converts date & time strings into valid iCalendar UTC & IST formatted timestamps
 */
export function getIcsTimestamps(dateStr: string, timeStr?: string): {
  dtStartUtc: string;
  dtEndUtc: string;
  dtStartLocal: string;
  dtEndLocal: string;
} {
  const months: Record<string, string> = {
    january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
  };

  const match = dateStr.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d+),\s+(\d{4})/i);
  
  let year = 2026;
  let month = 11;
  let day = 12;

  if (match) {
    month = parseInt(months[match[1].toLowerCase()] || '11', 10);
    day = parseInt(match[2], 10);
    year = parseInt(match[3], 10);
  }

  const { startHourIst, startMinIst, endHourIst, endMinIst } = parseEventTimeIST(timeStr);

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Format Local IST strings (YYYYMMDDTHHMMSS)
  const dtStartLocal = `${year}${pad(month)}${pad(day)}T${pad(startHourIst)}${pad(startMinIst)}00`;
  
  // Handle overflow if end time goes past midnight IST
  let endYear = year;
  let endMonth = month;
  let endDay = day;
  if (endHourIst < startHourIst) {
    endDay += 1;
  }
  const dtEndLocal = `${endYear}${pad(endMonth)}${pad(endDay)}T${pad(endHourIst)}${pad(endMinIst)}00`;

  // Convert IST (UTC+5:30) to UTC for Google Calendar Web links
  // IST Start Date Object in UTC: subtract 5h 30m
  const startIstMs = Date.UTC(year, month - 1, day, startHourIst, startMinIst) - (5.5 * 60 * 60 * 1000);
  const startUtcDate = new Date(startIstMs);

  const endIstMs = Date.UTC(endYear, endMonth - 1, endDay, endHourIst, endMinIst) - (5.5 * 60 * 60 * 1000);
  const endUtcDate = new Date(endIstMs);

  const formatUtc = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

  return {
    dtStartUtc: formatUtc(startUtcDate),
    dtEndUtc: formatUtc(endUtcDate),
    dtStartLocal,
    dtEndLocal,
  };
}

/**
 * Generates Google Calendar web event URL with exact IST start/end parameters
 */
export function getGoogleCalendarUrl(evt: CalendarEventParams): string {
  const { dtStartUtc, dtEndUtc } = getIcsTimestamps(evt.dateStr, evt.timeStr);
  const title = `${evt.title} - Arjun & Kanishka Wedding`;
  const details = `${evt.subtitle ? evt.subtitle + '\n' : ''}${evt.description}${evt.dressCode ? '\nDress Code: ' + evt.dressCode : ''}`;
  const location = [evt.venueName, evt.address].filter(Boolean).join(', ');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dtStartUtc}/${dtEndUtc}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&ctz=Asia/Kolkata`;
}

/**
 * Safari & Cross-Browser Compatible iCalendar (.ics) Download Trigger with explicit Asia/Kolkata Timezone
 */
export function triggerIcsDownload(evt: CalendarEventParams) {
  const { dtStartLocal, dtEndLocal, dtStartUtc } = getIcsTimestamps(evt.dateStr, evt.timeStr);

  const cleanTitle = evt.title.replace(/[^\w\s\-\&]/gi, '').trim();
  const locationText = [evt.venueName, evt.address].filter(Boolean).join(', ').replace(/[^\w\s\-\,\.]/gi, '').trim();
  const descText = `${evt.subtitle ? evt.subtitle + ' - ' : ''}${evt.description}${evt.dressCode ? ' | Dress Code: ' + evt.dressCode : ''}`.replace(/[^\w\s\-\,\.\:\&]/gi, '').trim();

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Arjun & Kanishka Wedding//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Kolkata',
    'X-LIC-LOCATION:Asia/Kolkata',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0530',
    'TZOFFSETTO:+0530',
    'TZNAME:IST',
    'DTSTART:19700101T000000',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${evt.id}-${dtStartUtc}@arjun-kanishka-wedding`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART;TZID=Asia/Kolkata:${dtStartLocal}`,
    `DTEND;TZID=Asia/Kolkata:${dtEndLocal}`,
    `SUMMARY:${cleanTitle} - Arjun & Kanishka Wedding`,
    `DESCRIPTION:${descText}`,
    `LOCATION:${locationText}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  try {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${evt.id}-arjun-kanishka-wedding.ics`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 200);
  } catch {
    const base64Content = typeof btoa !== 'undefined' ? btoa(unescape(encodeURIComponent(icsContent))) : '';
    const dataUri = 'data:text/calendar;charset=utf-8;base64,' + base64Content;
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `${evt.id}-arjun-kanishka-wedding.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Auto-detects device/browser and triggers the native calendar seamlessly:
 * - Apple (iOS / macOS / Safari) -> Triggers Apple Calendar (.ics) with Asia/Kolkata IST timezone
 * - Android / Windows / Chrome -> Opens Google Calendar directly with Asia/Kolkata IST parameters
 */
export function autoAddCalendarEvent(evt: CalendarEventParams) {
  const isAppleDevice =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod|Macintosh|MacIntel/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  if (isAppleDevice) {
    triggerIcsDownload(evt);
  } else {
    window.open(getGoogleCalendarUrl(evt), '_blank', 'noopener,noreferrer');
  }
}
