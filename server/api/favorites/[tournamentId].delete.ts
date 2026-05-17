/**
 * DELETE /api/favorites/:tournamentId — 즐겨찾기 제거
 */
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: number }).id
  const tournamentId = Number(getRouterParam(event, 'tournamentId'))

  await prisma.favorite.deleteMany({ where: { userId, tournamentId } })
  return { ok: true }
})
