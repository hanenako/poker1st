/**
 * PUT /api/admin/notices/:id
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id   = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const existing = await prisma.notice.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Notice not found' })

  return prisma.notice.update({
    where: { id },
    data: {
      title:         body.title         ?? existing.title,
      body:          body.body          ?? existing.body,
      coverImageUrl: body.coverImageUrl !== undefined ? (body.coverImageUrl || null) : existing.coverImageUrl,
      videoUrl:      body.videoUrl      !== undefined ? (body.videoUrl      || null) : existing.videoUrl,
      pinned:        body.pinned        ?? existing.pinned,
      publishedAt:   body.published
        ? (existing.publishedAt ?? new Date())
        : null
    }
  })
})
