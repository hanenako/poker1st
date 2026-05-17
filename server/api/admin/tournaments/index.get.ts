/**
 * GET /api/admin/tournaments
 * 관리자용 — draft 포함 전체 목록.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const rows = await prisma.tournament.findMany({
    include: { brand: { select: { id: true, slug: true, name: true } } },
    orderBy: { startDate: 'desc' }
  })
  return rows.map(applyStatus)
})
