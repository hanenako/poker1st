/**
 * GET /api/admin/notices
 * 관리자용 — draft 포함 전체.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return prisma.notice.findMany({
    include: { author: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  })
})
