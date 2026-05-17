/**
 * GET /api/leaderboard
 * 대회 결과를 집계한 리더보드 반환
 *
 * Query params:
 *   - brandId:       브랜드 필터
 *   - tournamentId:  특정 대회 필터
 *   - year:          연도 필터 (startDate 기준)
 *   - mode:          'prize' (상금순) | 'cashes' (입상수순) — default: prize
 *   - limit:         반환 개수 (default 50)
 */
export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const brandId      = q.brandId      ? Number(q.brandId)      : undefined
  const tournamentId = q.tournamentId ? Number(q.tournamentId) : undefined
  const year         = q.year         ? Number(q.year)         : undefined
  const limit        = Math.min(Number(q.limit) || 50, 200)

  // 필터 조건
  const where: Record<string, unknown> = {}
  if (tournamentId) {
    where.tournamentId = tournamentId
  } else {
    where.tournament = {}
    if (brandId) where.tournament.brandId = brandId
    if (year) {
      where.tournament.startDate = {
        gte: new Date(`${year}-01-01`),
        lt:  new Date(`${year + 1}-01-01`)
      }
    }
    where.tournament.publishedAt = { not: null }
  }

  const results = await prisma.tournamentResult.findMany({
    where,
    include: {
      tournament: {
        select: {
          id:         true,
          slug:       true,
          titleShort: true,
          startDate:  true,
          brand:      { select: { id: true, slug: true, name: true } }
        }
      },
      event: { select: { id: true, name: true } }
    },
    orderBy: [{ place: 'asc' }]
  })

  // 플레이어별 집계
  const map = new Map<string, {
    playerName:   string
    playerNameKo: string | null
    country:      string | null
    totalPrize:   number
    cashes:       number
    wins:         number
    entries:      Array<{
      tournamentSlug:  string
      tournamentTitle: string
      eventName:       string | null
      brandName:       string
      place:           number
      prizeText:       string | null
      prize:           number | null
      year:            number
    }>
  }>()

  for (const r of results) {
    const key = r.playerName.toLowerCase().trim()
    if (!map.has(key)) {
      map.set(key, {
        playerName:   r.playerName,
        playerNameKo: r.playerNameKo,
        country:      r.country,
        totalPrize:   0,
        cashes:       0,
        wins:         0,
        entries:      []
      })
    }
    const p = map.get(key)!
    const prizeNum = r.prize ? Number(r.prize) : 0
    p.totalPrize += prizeNum
    p.cashes     += 1
    if (r.place === 1) p.wins += 1
    p.entries.push({
      tournamentSlug:  r.tournament.slug,
      tournamentTitle: r.tournament.titleShort,
      eventName:       r.event?.name ?? null,
      brandName:       r.tournament.brand?.name ?? '',
      place:           r.place,
      prizeText:       r.prizeText,
      prize:           prizeNum || null,
      year:            new Date(r.tournament.startDate).getFullYear()
    })
  }

  const players = Array.from(map.values())
    .sort((a, b) => b.totalPrize - a.totalPrize || b.cashes - a.cashes)
    .slice(0, limit)
    .map((p, i) => ({ rank: i + 1, ...p }))

  return players
})
