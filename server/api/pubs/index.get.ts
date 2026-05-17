/**
 * GET /api/pubs
 *
 * Query params:
 *   - city: 도시명 (e.g. "Tokyo", "Osaka")
 *   - limit: 반환 개수
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const city = typeof query.city === 'string' ? query.city : undefined
  const limit = query.limit ? Number(query.limit) : undefined

  const pubs = await prisma.pub.findMany({
    where: {
      publishedAt: { not: null },
      ...(city ? { city } : {})
    },
    orderBy: [{ city: 'asc' }, { name: 'asc' }],
    take: limit
  })

  return pubs
})
