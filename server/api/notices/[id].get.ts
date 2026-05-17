/**
 * GET /api/notices/:id
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const notice = await prisma.notice.findUnique({
    where: { id, publishedAt: { not: null } },
    include: { author: { select: { name: true, email: true } } }
  })

  if (!notice) throw createError({ statusCode: 404, statusMessage: 'Notice not found' })
  return notice
})
