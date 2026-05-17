export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const tournamentId = Number(getRouterParam(event, 'id'))
  return prisma.tournamentResult.findMany({
    where: { tournamentId },
    orderBy: [{ place: 'asc' }],
    include: { event: { select: { id: true, name: true } } }
  })
})
