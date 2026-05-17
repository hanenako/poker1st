/**
 * GET /api/pubs/[slug]/congestion
 * 최근 2시간 이내 신고를 집계해서 현재 혼잡도 반환
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const pub  = await prisma.pub.findUnique({ where: { slug }, select: { id: true } })
  if (!pub) throw createError({ statusCode: 404 })

  const since = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2시간 전

  const reports = await prisma.congestionReport.findMany({
    where:   { pubId: pub.id, createdAt: { gte: since } },
    orderBy: { createdAt: 'desc' },
    take:    50
  })

  if (!reports.length) {
    return { status: null, count: 0, updatedAt: null }
  }

  // 다수결
  const tally: Record<string, number> = { QUIET: 0, NORMAL: 0, BUSY: 0 }
  for (const r of reports) tally[r.status] = (tally[r.status] || 0) + 1

  const status = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0]

  return {
    status,
    count:     reports.length,
    tally,
    updatedAt: reports[0].createdAt
  }
})
