/**
 * DELETE /api/admin/events/:id
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))

  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

  await prisma.event.delete({ where: { id } })
  return { ok: true }
})
