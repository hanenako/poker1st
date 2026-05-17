/**
 * DELETE /api/admin/notices/:id
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))

  const existing = await prisma.notice.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Notice not found' })

  await prisma.notice.delete({ where: { id } })
  return { ok: true }
})
