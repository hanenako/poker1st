/**
 * GET /api/tournaments
 *
 * Query params:
 *   - page:     페이지 번호 (default 1)
 *   - pageSize: 한 페이지 개수 (default 12)
 *   - featured: 1 | true  →  posterImageUrl 있는 published 것만
 *   - limit:    숫자       →  페이지네이션 없이 N개만 (홈용)
 *   - brand:    브랜드 slug (e.g. "jopt")
 *   - status:   UPCOMING | ONGOING | FINISHED
 */
export default defineEventHandler(async (event) => {
  const query    = getQuery(event)
  const featured = query.featured === '1' || query.featured === 'true'
  const limit    = query.limit ? Number(query.limit) : undefined
  const brand    = typeof query.brand  === 'string' && query.brand  ? query.brand  : undefined
  const status   = typeof query.status === 'string' && query.status ? query.status : undefined

  // limit 있으면 페이지네이션 없이 기존 동작 유지 (홈 섹션 등)
  if (limit !== undefined) {
    const tournaments = await prisma.tournament.findMany({
      where: {
        publishedAt: { not: null },
        ...(featured ? { posterImageUrl: { not: null } } : {})
      },
      include: { brand: { select: { slug: true, name: true, logoUrl: true } } },
      orderBy: { startDate: 'asc' },
      take: limit
    })

    const active   = tournaments.filter(t => t.status !== 'FINISHED' && t.status !== 'CANCELLED')
    const finished = tournaments.filter(t => t.status === 'FINISHED' || t.status === 'CANCELLED')
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())

    return [...active, ...finished].map(applyStatus)
  }

  // 페이지네이션 모드
  const page     = Math.max(1, Number(query.page)     || 1)
  const pageSize = Math.min(48, Number(query.pageSize) || 12)
  const skip     = (page - 1) * pageSize

  const where = {
    publishedAt: { not: null },
    ...(featured ? { posterImageUrl: { not: null } } : {}),
    ...(brand  ? { brand: { slug: brand } } : {}),
    ...(status ? { status } : {})
  }

  const [total, rows] = await Promise.all([
    prisma.tournament.count({ where }),
    prisma.tournament.findMany({
      where,
      include: { brand: { select: { slug: true, name: true, logoUrl: true } } },
      orderBy: [{ startDate: 'asc' }],
      skip,
      take: pageSize
    })
  ])

  return {
    data:     rows.map(applyStatus),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
})
