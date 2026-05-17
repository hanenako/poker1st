/**
 * GET /api/search?q=QUERY
 */
import { applyStatus } from '../utils/tournamentStatus'

// 도시명 별칭 (한글·일본어 → 영문, 양방향)
const CITY_MAP = {
  '도쿄': 'Tokyo',   '도코': 'Tokyo',   '동경': 'Tokyo',   '東京': 'Tokyo',
  '오사카': 'Osaka',  '대판': 'Osaka',   '大阪': 'Osaka',
  '후쿠오카': 'Fukuoka', '복강': 'Fukuoka', '福岡': 'Fukuoka',
  '나고야': 'Nagoya',  '名古屋': 'Nagoya',
  '삿포로': 'Sapporo', '札幌': 'Sapporo',
  '교토': 'Kyoto',   '京都': 'Kyoto',
  '요코하마': 'Yokohama', '横浜': 'Yokohama',
  '고베': 'Kobe',    '神戸': 'Kobe',
  '히로시마': 'Hiroshima', '広島': 'Hiroshima',
  '일본': 'Japan',   '日本': 'Japan',
}

// 영문 → 한글 역방향
const REVERSE_MAP = {}
for (const [ko, en] of Object.entries(CITY_MAP)) {
  if (!REVERSE_MAP[en]) REVERSE_MAP[en] = []
  REVERSE_MAP[en].push(ko)
}

function getTerms(q) {
  const set = new Set()
  set.add(q)

  // 한글 → 영문
  const enAlias = CITY_MAP[q]
  if (enAlias) set.add(enAlias)

  // 영문 → 한글 (대소문자 무시)
  const qLower = q.toLowerCase()
  for (const [en, koList] of Object.entries(REVERSE_MAP)) {
    if (en.toLowerCase() === qLower) {
      koList.forEach(k => set.add(k))
    }
  }

  return Array.from(set)
}

function orContains(field, terms) {
  return terms.map(t => ({ [field]: { contains: t, mode: 'insensitive' } }))
}

export default defineEventHandler(async (event) => {
  const q = String(getQuery(event).q ?? '').trim()
  if (!q) return { tournaments: [], pubs: [] }

  const terms = getTerms(q)

  const [tournaments, pubs] = await Promise.all([
    prisma.tournament.findMany({
      where: {
        publishedAt: { not: null },
        OR: [
          ...orContains('titleShort',    terms),
          ...orContains('titleFull',     terms),
          ...orContains('titleFullKo',   terms),
          ...orContains('titleFullJa',   terms),
          ...orContains('city',          terms),
          ...orContains('venueName',     terms),
          ...orContains('venueAddress',  terms),
          ...orContains('description',   terms),
          ...orContains('descriptionKo', terms),
          ...orContains('descriptionJa', terms),
        ]
      },
      include: { brand: { select: { slug: true, name: true, logoUrl: true } } },
      orderBy: { startDate: 'asc' },
      take: 15
    }),
    prisma.pub.findMany({
      where: {
        publishedAt: { not: null },
        OR: [
          ...orContains('name',          terms),
          ...orContains('nameKo',        terms),
          ...orContains('nameJa',        terms),
          ...orContains('city',          terms),
          ...orContains('district',      terms),
          ...orContains('address',       terms),
          ...orContains('addressKo',     terms),
          ...orContains('description',   terms),
          ...orContains('descriptionKo', terms),
          ...orContains('descriptionJa', terms),
        ]
      },
      orderBy: { name: 'asc' },
      take: 15
    })
  ])

  return {
    tournaments: tournaments.map(applyStatus),
    pubs
  }
})
