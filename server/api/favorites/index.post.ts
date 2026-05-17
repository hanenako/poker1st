/**
 * POST /api/favorites — 즐겨찾기 추가
 * body: { tournamentId }
 */
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: number }).id
  const { tournamentId } = await readBody<{ tournamentId: number }>(event)

  if (!tournamentId) throw createError({ statusCode: 400, statusMessage: 'tournamentId required' })

  await prisma.favorite.upsert({
    where: { userId_tournamentId: { userId, tournamentId } },
    create: { userId, tournamentId },
    update: {}
  })

  return { ok: true }
})
