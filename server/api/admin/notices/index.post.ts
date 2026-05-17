/**
 * POST /api/admin/notices
 */
export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event)
  const body    = await readBody(event)

  if (!body.title || !body.body) {
    throw createError({ statusCode: 400, statusMessage: 'title과 body는 필수입니다.' })
  }

  return prisma.notice.create({
    data: {
      title:         body.title,
      body:          body.body,
      coverImageUrl: body.coverImageUrl || null,
      videoUrl:      body.videoUrl      || null,
      pinned:        !!body.pinned,
      publishedAt:   body.published ? new Date() : null,
      authorId:      (session.user as { id: number }).id
    }
  })
})
