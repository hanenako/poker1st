/**
 * GET /api/admin/tournaments/:id/events
 * 해당 토너먼트의 이벤트 목록 (태그 포함).
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const tournamentId = Number(getRouterParam(event, 'id'))

  return prisma.event.findMany({
    where: { tournamentId },
    include: {
      tags: {
        include: { tag: true }
      }
    },
    orderBy: [{ date: 'asc' }, { registrationStart: 'asc' }, { orderNo: 'asc' }]
  })
})
