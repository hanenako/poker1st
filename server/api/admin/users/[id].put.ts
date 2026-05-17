/**
 * PUT /api/admin/users/:id
 * body: { role?: 'USER' | 'ADMIN', name?: string }
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id   = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ role?: string; name?: string }>(event)

  const data: Record<string, unknown> = {}
  if (body.role && ['USER', 'ADMIN'].includes(body.role)) data.role = body.role
  if (body.name !== undefined) data.name = body.name

  return prisma.user.update({ where: { id }, data, select: { id: true, email: true, role: true, name: true } })
})
