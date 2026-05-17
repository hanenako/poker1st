/**
 * DELETE /api/admin/users/:id
 * 자기 자신은 삭제 불가
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const session = await getUserSession(event)
  const meId    = (session.user as { id: number })?.id
  const id      = Number(getRouterParam(event, 'id'))

  if (id === meId) throw createError({ statusCode: 400, message: '자기 자신은 삭제할 수 없습니다.' })

  await prisma.user.delete({ where: { id } })
  return { ok: true }
})
