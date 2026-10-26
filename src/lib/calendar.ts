import type { CRFEvent } from '../services/wordpress/types';
/** Exporta somente datas reais da API; horário local WP em UTC-3. */
export function eventsCalendar(events: CRFEvent[], siteUrl: string): string {
  const escape = (value: string) => value.replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll('\r', '').replaceAll(';', '\\;').replaceAll(',', '\\,');
  const stamp = (value: string) => {
    const time = Date.parse(`${value.trim().replace(' ', 'T')}-03:00`);
    return Number.isFinite(time) ? new Date(time).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') : null;
  };
  const entries = events.flatMap(event => {
    const start = stamp(event.startDate);
    if (!start) return [];
    const end = stamp(event.endDate || '');
    return ['BEGIN:VEVENT', `UID:${event.id}@${new URL(siteUrl).hostname}`, `DTSTAMP:${start}`, `DTSTART:${start}`, ...(end ? [`DTEND:${end}`] : []), `SUMMARY:${escape(event.title.replace(/<[^>]*>/g, ''))}`, `LOCATION:${escape(event.location || '')}`, `URL:${siteUrl}/eventos/${encodeURIComponent(event.slug)}`, ...(event.cancelled ? ['STATUS:CANCELLED'] : []), 'END:VEVENT'];
  });
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CRF-AL//Eventos//PT-BR', ...entries, 'END:VCALENDAR'];
  // RFC 5545: dobrar linhas por octetos sem cortar caracteres UTF-8.
  const folded = lines.map(line => {
    let out = '', bytes = 0;
    for (const char of line) {
      const length = new TextEncoder().encode(char).length;
      if (bytes + length > 75) { out += '\r\n '; bytes = 1; }
      out += char; bytes += length;
    }
    return out;
  });
  return folded.join('\r\n') + '\r\n';
}
