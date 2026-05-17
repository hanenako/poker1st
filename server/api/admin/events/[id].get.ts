export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const ev = await prisma.event.findUnique({
    where: { id },
    select: { id: true, tournamentId: true, name: true, nameKo: true }
  })
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  return ev
})
