/**
 * GET /api/stats
 * 홈페이지 통계용 카운트.
 */
export default defineEventHandler(async () => {
  const [tournaments, pokerRooms, brands] = await Promise.all([
    prisma.tournament.count({ where: { publishedAt: { not: null } } }),
    prisma.pub.count({ where: { publishedAt: { not: null } } }),
    prisma.brand.count()
  ])

  return { tournaments, pokerRooms, brands }
})
