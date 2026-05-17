/**
 * GET /api/events
 *
 * Query params:
 *   brand    — brand slug (e.g. "jopt")
 *   game     — gameType string (e.g. "NLH", "PLO")
 *   maxBuyIn — 최대 바이인 (숫자, 엔)
 *   city     — 도시명
 *   limit    — 반환 개수
 */
export default defineEventHandler(async (event) => {
  const q = getQuery(event)

  const brand     = typeof q.brand     === 'string' ? q.brand     : undefined
  const game      = typeof q.game      === 'string' ? q.game      : undefined
  const city      = typeof q.city      === 'string' ? q.city      : undefined
  const maxBuyIn  = q.maxBuyIn ? Number(q.maxBuyIn) : undefined
  const limit     = q.limit    ? Number(q.limit)    : undefined

  const events = await prisma.event.findMany({
    where: {
      tournament: {
        publishedAt: { not: null },
        ...(brand ? { brand: { slug: brand } } : {}),
        ...(city  ? { city }                  : {})
      },
      ...(game     ? { gameType: { contains: game, mode: 'insensitive' } } : {}),
      ...(maxBuyIn ? { buyInAmount: { lte: maxBuyIn } }                    : {})
    },
    include: {
      tournament: {
        select: {
          slug: true,
          titleShort: true,
          city: true,
          brand: { select: { slug: true, name: true } }
        }
      },
      tags: {
        include: {
          tag: { select: { slug: true, name: true, category: true } }
        }
      }
    },
    orderBy: [{ date: 'asc' }, { registrationStart: 'asc' }, { orderNo: 'asc' }],
    take: limit
  })

  return events
})
