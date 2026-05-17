/**
 * DELETE /api/admin/tournaments/:id
 * 산하 events는 cascade로 같이 삭제됨 (schema에서 onDelete: Cascade).
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'invalid id' })
  }

  await prisma.tournament.delete({ where: { id } })
  return { ok: true }
})
