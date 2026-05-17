/**
 * GET /api/admin/tournaments/:id
 * 관리자 폼 로딩용.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'invalid id' })
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { brand: true }
  })

  if (!tournament) {
    throw createError({ statusCode: 404, statusMessage: 'not found' })
  }

  return applyStatus(tournament)
})
