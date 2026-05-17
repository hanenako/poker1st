/**
 * GET /api/tournaments.ics
 * 향후 2년간 예정된 대회를 iCalendar(.ics) 형식으로 반환
 * 구글 캘린더 / 애플 캘린더 / 아웃룩 구독 가능
 */
import { resolveStatus } from '../utils/tournamentStatus'

function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function icsEscape(s: string): string {
  return (s ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function foldLine(line: string): string {
  // RFC 5545: 75옥텟 초과 시 CRLF + SPACE 로 접기
  const bytes = Buffer.from(line, 'utf8')
  if (bytes.length <= 75) return line
  const chunks: string[] = []
  let pos = 0
  let first = true
  while (pos < bytes.length) {
    const take = first ? 75 : 74
    chunks.push(bytes.slice(pos, pos + take).toString('utf8'))
    pos += take
    first = false
  }
  return chunks.join('\r\n ')
}

export default defineEventHandler(async (event) => {
  const now = new Date()
  const twoYearsLater = new Date(now)
  twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2)

  const tournaments = await prisma.tournament.findMany({
    where: {
      publishedAt: { not: null },
      startDate: { lte: twoYearsLater },
      endDate:   { gte: now }
    },
    include: { brand: { select: { name: true } } },
    orderBy: { startDate: 'asc' }
  })

  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://pokertripjp.com'

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PokerTripJP//Japan Poker Tournaments//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:PokerTripJP — 일본 포커 대회',
    'X-WR-TIMEZONE:Asia/Tokyo',
    'X-WR-CALDESC:JOPT · APL · WPT 등 일본 주요 포커 대회 일정',
  ]

  for (const t of tournaments) {
    const status = resolveStatus(t.status, t.startDate, t.endDate)
    if (status === 'CANCELLED') continue

    const dtStart = new Date(t.startDate)
    dtStart.setHours(0, 0, 0, 0)
    const dtEnd = new Date(t.endDate)
    dtEnd.setHours(23, 59, 59, 0)

    const summary = [t.brand?.name, t.titleShort].filter(Boolean).join(' · ')
    const location = [t.venue, t.city, t.country].filter(Boolean).join(', ')
    const desc = [
      t.titleFull || t.titleShort,
      t.gtdJpy ? `보증상금: ¥${t.gtdJpy.toLocaleString()}` : '',
      t.mainBuyinJpy ? `메인 바이인: ¥${t.mainBuyinJpy.toLocaleString()}` : '',
      `${siteUrl}/tournaments/${t.slug}`
    ].filter(Boolean).join('\\n')

    lines.push('BEGIN:VEVENT')
    lines.push(foldLine(`UID:tournament-${t.id}@pokertripjp.com`))
    lines.push(foldLine(`DTSTAMP:${icsDate(now)}`))
    lines.push(foldLine(`DTSTART;VALUE=DATE:${dtStart.toISOString().slice(0,10).replace(/-/g,'')}`))
    lines.push(foldLine(`DTEND;VALUE=DATE:${new Date(dtEnd.getTime() + 86400000).toISOString().slice(0,10).replace(/-/g,'')}`))
    lines.push(foldLine(`SUMMARY:${icsEscape(summary)}`))
    lines.push(foldLine(`LOCATION:${icsEscape(location)}`))
    lines.push(foldLine(`DESCRIPTION:${icsEscape(desc)}`))
    lines.push(foldLine(`URL:${siteUrl}/tournaments/${t.slug}`))
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  const body = lines.join('\r\n') + '\r\n'

  setHeader(event, 'Content-Type', 'text/calendar; charset=utf-8')
  setHeader(event, 'Content-Disposition', 'attachment; filename="pokertripjp-tournaments.ics"')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  return body
})
