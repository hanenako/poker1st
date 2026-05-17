export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  return prisma.eventStructureLevel.findMany({
    where: { eventId: id },
    orderBy: { level: 'asc' }
  })
})
