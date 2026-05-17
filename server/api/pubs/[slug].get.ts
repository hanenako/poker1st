/**
 * GET /api/pubs/:slug
 * 펍 상세 + 이미지 + 리뷰(최근 10건).
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug is required' })
  }

  const pub = await prisma.pub.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { orderNo: 'asc' } },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } }
        }
      }
    }
  })

  if (!pub) {
    throw createError({ statusCode: 404, statusMessage: 'Pub not found' })
  }

  return pub
})
