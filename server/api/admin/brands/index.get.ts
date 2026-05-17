/**
 * GET /api/admin/brands
 * 관리자용 — 대회 수 포함 전체 목록.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return prisma.brand.findMany({
    include: { _count: { select: { tournaments: true } } },
    orderBy: { name: 'asc' }
  })
})
