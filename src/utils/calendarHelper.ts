export interface CalendarEventParams {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  dateStr: string;
  venueName?: string;
  address?: string;
  dressCode?: string;
}

/**
 * Converts date strings into valid iCalendar UTC start/end timestamps (DTSTART & DTEND)
 */
export function getIcsTimestamps(dateStr: string): { dtStart: string; dtEnd: string } {
  const months: Record<string, string> = {
    january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
  };

  const match = dateStr.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d+),\s+(\d{4})/i);
  
  let yyyymmdd = '20261112';
  if (match) {
    const m = months[match[1].toLowerCase()] || '11';
    const d = match[2].padStart(2, '0');
    const y = match[3];
    yyyymmdd = `${y}${m}${d}`;
  }

  // IST is UTC+5:30.
  // 6:00 PM IST (18:00 IST) = 12:30 UTC
  // 10:00 PM IST (22:00 IST) = 16:30 UTC
  const dtStart = `${yyyymmdd}T123000Z`;
  const dtEnd = `${yyyymmdd}T163000Z`;
  return { dtStart, dtEnd };
}

/**
 * Safari & Cross-Browser Compatible iCalendar (.ics) Download Trigger
 */
export function triggerIcsDownload(evt: CalendarEventParams) {
  const { dtStart, dtEnd } = getIcsTimestamps(evt.dateStr);

  const cleanTitle = evt.title.replace(/[^\w\s\-\&]/gi, '').trim();
  const locationText = [evt.venueName, evt.address].filter(Boolean).join(', ').replace(/[^\w\s\-\,\.]/gi, '').trim();
  const descText = `${evt.subtitle ? evt.subtitle + ' - ' : ''}${evt.description}${evt.dressCode ? ' | Dress Code: ' + evt.dressCode : ''}`.replace(/[^\w\s\-\,\.\:\&]/gi, '').trim();

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Arjun & Kanishka Wedding//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${evt.id}-${dtStart}@arjun-kanishka-wedding`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${cleanTitle} - Arjun & Kanishka Wedding`,
    `DESCRIPTION:${descText}`,
    `LOCATION:${locationText}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  // Detect iOS / Safari
  const isSafari =
    typeof navigator !== 'undefined' &&
    (/^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  if (isSafari) {
    // Mobile Safari / iOS Safari / macOS Safari: data URI or window.location triggers Apple Calendar directly!
    const dataUri = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent);
    window.location.href = dataUri;
  } else {
    // Chrome / Edge / Firefox / Android
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${evt.id}-arjun-kanishka-wedding.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 200);
  }
}
