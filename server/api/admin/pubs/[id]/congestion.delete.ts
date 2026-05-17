/**
 * DELETE /api/admin/pubs/:id/congestion
 * 해당 포커룸의 혼잡도 기록 전체 초기화 (어드민 전용)
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid pub id' })

  const pub = await prisma.pub.findUnique({ where: { id } })
  if (!pub) throw createError({ statusCode: 404, statusMessage: 'Pub not found' })

  const { count } = await prisma.congestionReport.deleteMany({
    where: { pubId: id }
  })

  return { ok: true, deleted: count }
})
