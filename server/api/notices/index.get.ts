/**
 * GET /api/notices
 * publishedAt 있는 공지만 반환, 최신순.
 */
export default defineEventHandler(async () => {
  return prisma.notice.findMany({
    where:   { publishedAt: { not: null } },
    include: { author: { select: { name: true, email: true } } },
    orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }]
  })
})
