/**
 * GET /api/admin/pubs
 * 관리자용 — draft 포함 전체 목록.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return prisma.pub.findMany({
    orderBy: [{ city: 'asc' }, { name: 'asc' }]
  })
})
