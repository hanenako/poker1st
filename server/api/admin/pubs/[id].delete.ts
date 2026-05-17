/**
 * DELETE /api/admin/pubs/:id
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))

  const existing = await prisma.pub.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Pub not found' })

  await prisma.pub.delete({ where: { id } })
  return { ok: true }
})
