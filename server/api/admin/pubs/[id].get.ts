/**
 * GET /api/admin/pubs/:id
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))

  const pub = await prisma.pub.findUnique({
    where: { id },
    include: { images: { orderBy: { orderNo: 'asc' } } }
  })
  if (!pub) throw createError({ statusCode: 404, statusMessage: 'Pub not found' })

  return pub
})
