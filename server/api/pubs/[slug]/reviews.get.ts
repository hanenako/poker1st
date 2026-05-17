export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const pub  = await prisma.pub.findUnique({ where: { slug }, select: { id: true } })
  if (!pub) throw createError({ statusCode: 404 })

  const reviews = await prisma.pubReview.findMany({
    where:   { pubId: pub.id },
    select: {
      id:               true,
      nickname:         true,
      ratingAtmosphere: true,
      ratingDealer:     true,
      ratingWait:       true,
      ratingValue:      true,
      title:            true,
      body:             true,
      createdAt:        true,
      user: { select: { id: true, name: true, avatarUrl: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return reviews
})
