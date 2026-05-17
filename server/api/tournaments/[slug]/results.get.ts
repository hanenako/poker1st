export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    select: { id: true, status: true }
  })
  if (!tournament) throw createError({ statusCode: 404 })

  return prisma.tournamentResult.findMany({
    where: { tournamentId: tournament.id },
    orderBy: [{ place: 'asc' }],
    include: { event: { select: { id: true, name: true } } }
  })
})
